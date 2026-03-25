package flows

import (
	"strings"

	"github.com/JustLABv1/justflow/apps/backend/pkg/models"
)

// depActionID extracts just the action ID from a dependency string.
// Dependency strings may encode the output handle: "actionId:success" or "actionId:fail".
// Plain "actionId" (no colon) is treated as "actionId:success".
func depActionID(dep string) string {
	if idx := strings.Index(dep, ":"); idx >= 0 {
		return dep[:idx]
	}
	return dep
}

// hasCycle returns true if the depends_on graph among actions contains a cycle.
// Uses Kahn's algorithm (topological sort via in-degree counting).
func hasCycle(actions []models.Action) bool {
	inDegree := make(map[string]int, len(actions))
	for _, a := range actions {
		id := a.ID.String()
		if _, exists := inDegree[id]; !exists {
			inDegree[id] = 0
		}
		for _, dep := range a.DependsOn {
			inDegree[id]++
			srcID := depActionID(dep)
			if _, exists := inDegree[srcID]; !exists {
				inDegree[srcID] = 0
			}
		}
	}

	queue := []string{}
	for id, deg := range inDegree {
		if deg == 0 {
			queue = append(queue, id)
		}
	}

	visited := 0
	for len(queue) > 0 {
		cur := queue[0]
		queue = queue[1:]
		visited++

		// Find actions that depend on cur and decrement their in-degree
		for _, a := range actions {
			for _, dep := range a.DependsOn {
				if depActionID(dep) == cur {
					id := a.ID.String()
					inDegree[id]--
					if inDegree[id] == 0 {
						queue = append(queue, id)
					}
				}
			}
		}
	}

	return visited != len(inDegree)
}
