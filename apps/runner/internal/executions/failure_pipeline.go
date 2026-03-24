package internal_executions

import (
	"errors"
	"time"

	"github.com/JustLABv1/justflow/pkg/contracts"
	"github.com/JustLABv1/runner/config"
	"github.com/JustLABv1/runner/pkg/executions"
	"github.com/JustLABv1/runner/pkg/plugins"
)

func startFailurePipeline(cfg *config.Config, workspace string, actions []models.Action, loadedPlugins map[string]plugins.Plugin, flow models.Flows, flowBytes []byte, alert models.Alerts, steps []models.ExecutionSteps, failedStep models.ExecutionSteps, execution models.Executions) error {
	var failurePipelineID string

	// create step which tells the user that the flow failed and the failover pipeline will start
	var stepToSend = models.ExecutionSteps{
		ExecutionID: execution.ID.String(),
		Action: models.Action{
			Name:        "Failure Pipeline",
			Description: "Run separate pipeline for failure",
			Version:     "1.0.0",
			Icon:        "hugeicons:structure-fail",
			Category:    "runner",
		},
		Messages: []models.Message{
			{
				Title: "Failure Pipeline",
				Lines: []models.Line{
					{
						Content:   "Execution failed, starting failure pipeline",
						Color:     "warning",
						Timestamp: time.Now(),
					},
				},
			},
		},
		Status:     "warning",
		RunnerID:   execution.RunnerID,
		CreatedAt:  time.Now(),
		StartedAt:  time.Now(),
		FinishedAt: time.Now(),
	}

	// check if the failed step has an failure pipeline assigned and or the flow
	if flow.FailurePipelineID != "" {
		failurePipelineID = flow.FailurePipelineID

		stepToSend.Messages = append(stepToSend.Messages, models.Message{
			Title: "Failure Pipeline",
			Lines: []models.Line{
				{
					Content:   "Flow has a failure pipeline assigned, this pipeline will be used",
					Color:     "warning",
					Timestamp: time.Now(),
				},
				{
					Content:   "Pipeline ID: " + flow.FailurePipelineID,
					Timestamp: time.Now(),
				},
			},
		})
	} else if failedStep.Action.FailurePipelineID != "" {
		failurePipelineID = failedStep.Action.FailurePipelineID

		stepToSend.Messages = append(stepToSend.Messages, models.Message{
			Title: "Failure Pipeline",
			Lines: []models.Line{
				{
					Content:   "The failed step has a failure pipeline assigned, this pipeline will be used",
					Color:     "warning",
					Timestamp: time.Now(),
				},
				{
					Content:   "Step ID: " + failedStep.ID.String(),
					Timestamp: time.Now(),
				},
				{
					Content:   "Step Name: " + failedStep.Action.Name,
					Timestamp: time.Now(),
				},
				{
					Content:   "Pipeline ID: " + failedStep.Action.FailurePipelineID,
					Timestamp: time.Now(),
				},
			},
		})
	}

	_, err := executions.SendStep(nil, execution, stepToSend)
	if err != nil {
		return err
	}

	// send failure pipeline steps
	var targetPipeline models.FailurePipeline
	var failurePipelineSteps []models.ExecutionSteps
	for _, pipeline := range flow.FailurePipelines {
		if pipeline.ID.String() == failurePipelineID {
			targetPipeline = pipeline

			for _, action := range pipeline.Actions {
				if !action.Active {
					continue
				}

				step := models.ExecutionSteps{
					Action:      action,
					ExecutionID: execution.ID.String(),
					Status:      "pending",
				}

				// handle custom name
				if action.CustomName != "" {
					step.Action.Name = action.CustomName
				}

				stepID, err := executions.SendStep(nil, execution, step)
				if err != nil {
					return err
				}
				step.ID = stepID.ID

				failurePipelineSteps = append(failurePipelineSteps, step)
			}
		}
	}

	// process each failure pipeline step in sequential order where pending is true
	if !targetPipeline.ExecParallel {
		for _, step := range failurePipelineSteps {
			if step.Status == "pending" {
				res, success, canceled, err := processStep(cfg, workspace, actions, loadedPlugins, flow, flowBytes, alert, failurePipelineSteps, step, execution)
				if err != nil {
					// cancel remaining steps
					cancelRemainingSteps(execution.ID.String())
					return err
				}

				if res.Data["status"] == "noPatternMatch" {
					cancelRemainingSteps(execution.ID.String())
					return errors.New("no pattern match")
				}

				if res.Data["status"] == "canceled" {
					cancelRemainingSteps(execution.ID.String())
					return errors.New("execution canceled")
				}

				if canceled {
					cancelRemainingSteps(execution.ID.String())
					return errors.New("execution canceled")
				}

				if !success {
					cancelRemainingSteps(execution.ID.String())
					return errors.New("failed to process step")
				}

			}
		}
	} else {
		// parallel execution
		var executedSteps int
		var failedSteps int
		var noPatternMatchSteps int
		var canceledSteps int
		var successSteps int
		for _, step := range failurePipelineSteps {
			if step.Status == "pending" {
				go func() {
					res, success, canceled, err := processStep(cfg, workspace, actions, loadedPlugins, flow, flowBytes, alert, failurePipelineSteps, step, execution)
					if err != nil {
						failedSteps++
					}

					executedSteps++

					if res.Data["status"] == "noPatternMatch" {
						noPatternMatchSteps++
					}

					if res.Data["status"] == "canceled" {
						canceledSteps++
					}

					if canceled {
						canceledSteps++
					}

					if !success {
						failedSteps++
					}

					if success {
						successSteps++
					}
				}()
			}
		}

		// wait for all steps to finish
		for executedSteps < len(failurePipelineSteps) {
			if executedSteps == len(failurePipelineSteps) {
				break
			}
		}

		if failedSteps > 0 {
			return errors.New("failed to process steps")
		}

		if canceledSteps > 0 {
			return errors.New("steps canceled")
		}

		if noPatternMatchSteps > 0 {
			return errors.New("steps with no pattern match")
		}
	}

	return nil
}
