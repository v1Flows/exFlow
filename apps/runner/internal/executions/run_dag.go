package internal_executions

import (
	"strings"
	"sync"

	jf_models "github.com/JustLABv1/justflow/pkg/contracts"
	"github.com/JustLABv1/runner/config"
	"github.com/JustLABv1/runner/pkg/plugins"
)

// parseDep splits a dependency string into (actionID, handle).
// Format: "actionId:success" | "actionId:fail" | "actionId" (defaults to "success").
func parseDep(dep string) (actionID, handle string) {
	if idx := strings.Index(dep, ":"); idx >= 0 {
		actionID = dep[:idx]
		h := dep[idx+1:]
		if h == "fail" {
			handle = "fail"
		} else {
			handle = "success"
		}
	} else {
		actionID = dep
		handle = "success"
	}
	return
}

type depEdge struct {
	actionID string
	handle   string
}

// runDAG executes the flow's actions according to their depends_on DAG with
// handle-aware success/fail edge routing.
//
// Each dependency string may encode which output handle triggered the edge:
//   - "actionId" or "actionId:success" → depends on the success output
//   - "actionId:fail"                  → depends on the fail output
//
// When an upstream node succeeds, only ":success" (and plain) deps are satisfied;
// ":fail" deps of that node are permanently blocked (the downstream is canceled).
// When an upstream node fails, only ":fail" deps are satisfied; ":success" deps
// are permanently blocked.
//
// Cancellation propagates naturally: a canceled node emits a canceled result,
// which in turn blocks its own downstream via the same handle logic.
//
// Returns: "success" | "error" | "canceled" | "noPatternMatch".
func runDAG(
	cfg *config.Config,
	workspace string,
	actions []jf_models.Action,
	loadedPlugins map[string]plugins.Plugin,
	flow jf_models.Flows,
	flowBytes []byte,
	alert jf_models.Alerts,
	steps []jf_models.ExecutionSteps,
	execution jf_models.Executions,
) string {
	// Build per-node dependency list and in-degree map.
	nodeDeps := make(map[string][]depEdge, len(steps))
	stepByID := make(map[string]jf_models.ExecutionSteps, len(steps))
	inDegree := make(map[string]int, len(steps))

	for _, s := range steps {
		id := s.Action.ID.String()
		stepByID[id] = s
		for _, dep := range s.Action.DependsOn {
			aID, h := parseDep(dep)
			nodeDeps[id] = append(nodeDeps[id], depEdge{actionID: aID, handle: h})
			inDegree[id]++
		}
	}

	type outcome struct {
		actionID       string
		success        bool
		canceled       bool
		noPatternMatch bool
		err            error
		step           jf_models.ExecutionSteps
	}

	var mu sync.Mutex
	resultCh := make(chan outcome, len(steps))
	canceledSet := make(map[string]bool)
	launchedSet := make(map[string]bool)

	// launchStep must be called with mu held.
	// It spawns a goroutine that either skips (canceled) or runs the step.
	launchStep := func(s jf_models.ExecutionSteps) {
		id := s.Action.ID.String()
		if launchedSet[id] {
			return
		}
		launchedSet[id] = true
		skip := canceledSet[id]

		go func(step jf_models.ExecutionSteps, skipIt bool) {
			if skipIt {
				resultCh <- outcome{actionID: step.Action.ID.String(), canceled: true, step: step}
				return
			}

			res, success, canceled, err := processStep(cfg, workspace, actions, loadedPlugins, flow, flowBytes, alert, steps, step, execution)

			o := outcome{
				actionID: step.Action.ID.String(),
				step:     step,
				err:      err,
				success:  success,
				canceled: canceled || (res.Data != nil && res.Data["status"] == "canceled"),
			}
			if res.Data != nil && res.Data["status"] == "noPatternMatch" {
				o.noPatternMatch = true
			}
			if err != nil || !success {
				o.success = false
			}
			resultCh <- o
		}(s, skip)
	}

	// Seed: launch all root nodes (no dependencies).
	mu.Lock()
	for _, s := range steps {
		if inDegree[s.Action.ID.String()] == 0 {
			launchStep(s)
		}
	}
	mu.Unlock()

	finalStatus := "success"
	completed := 0
	total := len(steps)

	for completed < total {
		o := <-resultCh
		completed++

		if o.noPatternMatch {
			finalStatus = "noPatternMatch"
			// Cancel everything remaining.
			mu.Lock()
			for _, s := range steps {
				canceledSet[s.Action.ID.String()] = true
			}
			mu.Unlock()
		} else if o.canceled {
			if finalStatus == "success" {
				finalStatus = "canceled"
			}
		} else if !o.success || o.err != nil {
			if finalStatus == "success" || finalStatus == "canceled" {
				finalStatus = "error"
			}
		}

		// Route downstream: for each node that has a dep on the just-completed node,
		// determine whether that dep is satisfied or permanently blocked.
		mu.Lock()
		for _, s := range steps {
			id := s.Action.ID.String()
			if launchedSet[id] || canceledSet[id] {
				continue
			}
			for _, dep := range nodeDeps[id] {
				if dep.actionID != o.actionID {
					continue
				}
				// Determine whether this dependency is satisfied or blocked.
				var satisfied bool
				if o.canceled {
					// Upstream canceled → block this node regardless of handle.
					canceledSet[id] = true
					launchStep(s) // goroutine sees canceledSet → sends canceled result
				} else if (dep.handle == "success" && o.success) || (dep.handle == "fail" && !o.success) {
					// Handle matches outcome → satisfy this dep.
					satisfied = true
					inDegree[id]--
					if inDegree[id] == 0 {
						launchStep(s)
					}
				} else {
					// Handle mismatch (e.g. wanted :fail but upstream succeeded) → block.
					canceledSet[id] = true
					launchStep(s)
				}
				_ = satisfied
				break // each node has at most one dep per upstream action
			}
		}
		mu.Unlock()
	}

	return finalStatus
}
