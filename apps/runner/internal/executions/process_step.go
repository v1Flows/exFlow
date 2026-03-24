package internal_executions

import (
	"errors"
	"time"

	"github.com/JustLABv1/justflow/pkg/contracts"
	"github.com/JustLABv1/runner/config"
	internal_actions "github.com/JustLABv1/runner/internal/actions"
	"github.com/JustLABv1/runner/internal/common"
	"github.com/JustLABv1/runner/pkg/executions"
	"github.com/JustLABv1/runner/pkg/plugins"

	log "github.com/sirupsen/logrus"
)

func RegisterActions(loadedPluginActions []models.Plugin) (actions []models.Action) {
	for _, plugin := range loadedPluginActions {
		actions = append(actions, plugin.Action)
	}

	if len(actions) == 0 {
		actions = []models.Action{}
	}

	return actions
}

func getActionByFlowActions(actions []models.Action, step models.ExecutionSteps) (action models.Action, found bool) {
	for _, a := range actions {
		if a.Plugin == step.Action.Plugin {
			return a, true
		}
	}
	return models.Action{}, false
}

func processStep(cfg *config.Config, workspace string, actions []models.Action, loadedPlugins map[string]plugins.Plugin, flow models.Flows, flowBytes []byte, alert models.Alerts, steps []models.ExecutionSteps, step models.ExecutionSteps, execution models.Executions) (res plugins.Response, success bool, canceled bool, err error) {
	step.Status = "running"
	step.StartedAt = time.Now()
	step.RunnerID = execution.RunnerID

	if err := executions.UpdateStep(nil, execution.ID.String(), step); err != nil {
		log.Error(err)
		return plugins.Response{}, false, false, err
	}

	valid, danger, pluginVersion := common.CheckActionVersionAgainstPluginVersion(actions, step)

	if !valid {
		// dont execute step and quit execution
		step.Messages = append(step.Messages, models.Message{
			Title: "Error",
			Lines: []models.Line{
				{
					Content:   "Action not compatible with plugin version",
					Color:     "danger",
					Timestamp: time.Now(),
				},
				{
					Content:   "Plugin Version: " + pluginVersion,
					Color:     "danger",
					Timestamp: time.Now(),
				},
				{
					Content:   "Action Version: " + step.Action.Version,
					Color:     "danger",
					Timestamp: time.Now(),
				},
				{
					Content:   "Cancel execution",
					Color:     "danger",
					Timestamp: time.Now(),
				},
			},
		})
		step.Status = "error"
		step.FinishedAt = time.Now()

		if err := executions.UpdateStep(nil, execution.ID.String(), step); err != nil {
			log.Error(err)
			return plugins.Response{}, false, false, err
		}

		return plugins.Response{}, false, false, nil
	}

	if danger {
		// modify the pickup step
		err = executions.UpdateStep(nil, execution.ID.String(), models.ExecutionSteps{
			ID: step.ID,
			Messages: []models.Message{
				{
					Title: "Caution",
					Lines: []models.Line{
						{
							Content:   "Plugin version is higher than action version. This may cause issues but execution will still be processed.",
							Timestamp: time.Now(),
							Color:     "warning",
						},
					},
				},
			},
			Status: "running",
		})
		if err != nil {
			return plugins.Response{}, false, false, err
		}
	}

	if _, ok := loadedPlugins[step.Action.Plugin]; !ok {
		log.Warnf("Action %s not found", step.Action.Plugin)

		step.Messages = append(step.Messages, models.Message{
			Title: "Error",
			Lines: []models.Line{
				{
					Content:   "Action not found in loaded plugins",
					Color:     "danger",
					Timestamp: time.Now(),
				},
				{
					Content:   "Target plugin: " + step.Action.Plugin,
					Color:     "danger",
					Timestamp: time.Now(),
				},
				{
					Content:   "Cancel execution",
					Color:     "danger",
					Timestamp: time.Now(),
				},
			},
		})
		step.Status = "error"
		step.FinishedAt = time.Now()

		if err := executions.UpdateStep(nil, execution.ID.String(), step); err != nil {
			log.Error(err)
			return plugins.Response{}, false, false, err
		}

		return plugins.Response{}, false, false, errors.New("plugin not found")
	}

	_, found := getActionByFlowActions(flow.Actions, step)
	if found {
		if step.Action.Condition.SelectedActionID != "" {
			pass, err := internal_actions.CheckConditions(cfg, steps, step, execution)
			if err != nil {
				log.Error(err)

				step.Messages = append(step.Messages, models.Message{
					Title: "Error",
					Lines: []models.Line{
						{
							Content:   "Failed to execute action",
							Color:     "danger",
							Timestamp: time.Now(),
						},
						{
							Content:   "Error: " + err.Error(),
							Color:     "danger",
							Timestamp: time.Now(),
						},
						{
							Content:   "Cancel execution",
							Color:     "danger",
							Timestamp: time.Now(),
						},
					},
				})
				step.Status = "error"
				step.FinishedAt = time.Now()

				if err := executions.UpdateStep(nil, execution.ID.String(), step); err != nil {
					log.Error(err)
					return plugins.Response{}, false, false, err
				}

				return plugins.Response{}, false, false, err
			}

			if !pass {
				if step.Action.Condition.CancelExecution {
					step.Status = "canceled"
				} else {
					step.Status = "skipped"
				}
				step.FinishedAt = time.Now()

				if err := executions.UpdateStep(nil, execution.ID.String(), step); err != nil {
					log.Error(err)
					return plugins.Response{}, false, false, err
				}

				if step.Action.Condition.CancelExecution {
					return plugins.Response{}, false, true, nil
				} else {
					return plugins.Response{}, true, false, nil
				}
			}
		}
	}

	req := plugins.ExecuteTaskRequest{
		Config:    cfg,
		Flow:      flow,
		FlowBytes: flowBytes,
		Execution: execution,
		Step:      step,
		Alert:     alert,
		Workspace: workspace,
	}

	res, err = loadedPlugins[step.Action.Plugin].ExecuteTask(req)
	if err != nil {
		log.Error(err)

		step.Messages = append(step.Messages, models.Message{
			Title: "Error",
			Lines: []models.Line{
				{
					Content:   "Failed to execute action",
					Color:     "danger",
					Timestamp: time.Now(),
				},
				{
					Content:   "Error: " + err.Error(),
					Color:     "danger",
					Timestamp: time.Now(),
				},
				{
					Content:   "Cancel execution",
					Color:     "danger",
					Timestamp: time.Now(),
				},
			},
		})
		step.Status = "error"
		step.FinishedAt = time.Now()

		if err := executions.UpdateStep(nil, execution.ID.String(), step); err != nil {
			log.Error(err)
			return plugins.Response{}, false, false, err
		}

		return plugins.Response{}, false, false, err
	}

	if res.Canceled {
		return res, false, true, nil
	} else if res.Success {
		return res, true, false, nil
	} else {
		return res, false, false, nil
	}

	// return data, true, false, false, false, nil
}
