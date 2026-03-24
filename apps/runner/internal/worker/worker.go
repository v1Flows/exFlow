package worker

import (
	"github.com/JustLABv1/justflow/pkg/contracts"
	internal_executions "github.com/JustLABv1/runner/internal/executions"
	"github.com/JustLABv1/runner/pkg/plugins"
)

func StartWorker(actions []models.Action, loadedPlugins map[string]plugins.Plugin) {
	internal_executions.GetPendingExecutions(actions, loadedPlugins)
}
