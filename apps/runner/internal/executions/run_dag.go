package internal_executions

import (
	"strings"
	"sync"
	"time"

	jf_models "github.com/JustLABv1/justflow/pkg/contracts"
	"github.com/JustLABv1/runner/config"
	"github.com/JustLABv1/runner/pkg/executions"
	"github.com/JustLABv1/runner/pkg/plugins"
	log "github.com/sirupsen/logrus"
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
// A node with multiple incoming edges fires once per satisfied edge
// (run-per-edge semantics). The first firing reuses the pre-created step
// record; subsequent firings register a new cloned step in the backend so
// each run has its own DB record.
//
// Cancellation propagates: a canceled upstream blocks its downstream nodes
// regardless of handle. Nodes that are never triggered (all incoming edges
// mismatched) are marked canceled in the DB after the DAG completes.
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
	// Build per-node dependency list.
	nodeDeps := make(map[string][]depEdge, len(steps))

	for _, s := range steps {
		id := s.Action.ID.String()
		for _, dep := range s.Action.DependsOn {
			aID, h := parseDep(dep)
			nodeDeps[id] = append(nodeDeps[id], depEdge{actionID: aID, handle: h})
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
	// Buffer generously: each step can be triggered by at most len(steps) edges.
	resultCh := make(chan outcome, len(steps)*len(steps)+1)
	canceledSet := make(map[string]bool)
	launchCount := make(map[string]int, len(steps))
	totalLaunched := 0

	// launchStep must be called with mu held.
	// parentActionID is the action ID of the upstream that triggered this launch.
	// The first launch (launchCount == 0) reuses the pre-created step record.
	// Subsequent launches register a new cloned step in the backend.
	launchStep := func(s jf_models.ExecutionSteps, parentActionID string) {
		id := s.Action.ID.String()
		count := launchCount[id]
		launchCount[id]++
		totalLaunched++

		skip := canceledSet[id]
		isClone := count > 0

		cloneTemplate := jf_models.ExecutionSteps{
			Action:      s.Action,
			ExecutionID: s.ExecutionID,
			Status:      "pending",
			ParentID:    parentActionID,
		}

		go func(original jf_models.ExecutionSteps, template jf_models.ExecutionSteps, skipIt bool, clone bool) {
			var step jf_models.ExecutionSteps
			if clone && !skipIt {
				// Register a new step record for this extra run.
				registered, err := executions.SendStep(nil, execution, template)
				if err != nil {
					log.Error("Failed to register cloned step: ", err)
					resultCh <- outcome{
						actionID: original.Action.ID.String(),
						err:      err,
						step:     original,
					}
					return
				}
				step = template
				step.ID = registered.ID
			} else {
				step = original
			}

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
		}(s, cloneTemplate, skip, isClone)
	}

	// Seed: launch all root nodes (no dependencies).
	mu.Lock()
	for _, s := range steps {
		if len(nodeDeps[s.Action.ID.String()]) == 0 {
			launchStep(s, "")
		}
	}
	mu.Unlock()

	finalStatus := "success"
	completed := 0

	for {
		o := <-resultCh
		completed++

		if o.noPatternMatch {
			finalStatus = "noPatternMatch"
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

		// Route downstream: launch each node that has a satisfied dep on the
		// just-completed node. Each satisfied edge fires an independent launch
		// (run-per-edge semantics).
		mu.Lock()
		if !o.noPatternMatch {
			for _, s := range steps {
				id := s.Action.ID.String()
				if canceledSet[id] {
					continue
				}
				for _, dep := range nodeDeps[id] {
					if dep.actionID != o.actionID {
						continue
					}
					if o.canceled {
						// Upstream canceled → block this node regardless of handle.
						canceledSet[id] = true
					} else if (dep.handle == "success" && o.success) || (dep.handle == "fail" && !o.success) {
						// Handle matches → launch once per satisfied edge.
						launchStep(s, o.actionID)
					}
					// Handle mismatch: this edge does not trigger the node.
					// Other upstream edges may still trigger it independently.
					break // each node has at most one dep per upstream action
				}
			}
		}
		done := completed >= totalLaunched
		mu.Unlock()

		if done {
			break
		}
	}

	// Cleanup: cancel steps that were never triggered (all incoming edges
	// were handle-mismatches or their upstream was canceled before firing).
	for _, s := range steps {
		if launchCount[s.Action.ID.String()] == 0 {
			s.Status = "canceled"
			s.CanceledBy = "Runner"
			s.CanceledAt = time.Now()
			s.FinishedAt = time.Now()
			if err := executions.UpdateStep(nil, execution.ID.String(), s); err != nil {
				log.Error("Failed to cancel untriggered step: ", err)
			}
		}
	}

	return finalStatus
}
