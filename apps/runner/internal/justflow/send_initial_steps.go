package internal_justflow

import (
	"time"

	"github.com/JustLABv1/justflow/pkg/contracts"
	"github.com/JustLABv1/runner/config"
	"github.com/JustLABv1/runner/pkg/executions"

	log "github.com/sirupsen/logrus"
)

func SendInitialSteps(cfg *config.Config, actions []models.Action, execution models.Executions) (stepsWithIDs []models.ExecutionSteps, err error) {
	var initialSteps = []models.ExecutionSteps{
		{
			Action: models.Action{
				Plugin: "collect_data",
				Params: []models.Params{
					{
						Key:   "FlowID",
						Value: execution.FlowID,
					},
					{
						Key:   "LogData",
						Value: "false",
					},
				},
			},
			Status:    "pending",
			CreatedAt: time.Now(),
		},
		{
			Action: models.Action{
				Plugin: "actions_check",
			},
			Status:    "pending",
			CreatedAt: time.Now(),
		},
	}

	if execution.AlertID != "" {
		initialSteps = append(initialSteps, models.ExecutionSteps{
			Action: models.Action{
				Plugin: "pattern_check",
			},
			Status:    "pending",
			CreatedAt: time.Now(),
		})
	}

	// get all current steps to modify the pickup step
	steps, err := executions.GetSteps(nil, execution.ID.String())
	if err != nil {
		log.Error("Failed to get steps for execution: ", err)
		return
	}
	for _, step := range steps {
		if step.Action.Name == "Pick Up" {
			// modify the pickup step
			err = executions.UpdateStep(nil, execution.ID.String(), models.ExecutionSteps{
				ID: step.ID,
				Messages: []models.Message{
					{
						Title: "Pick Up",
						Lines: []models.Line{
							{
								Content:   execution.RunnerID + " picked up the execution",
								Timestamp: time.Now(),
								Color:     "success",
							},
						},
					},
				},
				Status:     "success",
				RunnerID:   execution.RunnerID,
				FinishedAt: time.Now(),
			})
			if err != nil {
				return nil, err
			}
		}
	}

	for i, step := range initialSteps {
		step.ExecutionID = execution.ID.String()

		// get action plugin info
		for _, action := range actions {
			if action.Plugin == step.Action.Plugin {
				if step.Action.Name == "" || step.Action.Description == "" {
					step.Action.Name = action.Name
					step.Action.Description = action.Description
					step.Action.Version = action.Version
					step.Action.Icon = action.Icon
					step.Action.Category = action.Category
				}
			}
		}

		stepID, err := executions.SendStep(nil, execution, step)
		if err != nil {
			return nil, err
		}
		step.ID = stepID.ID
		initialSteps[i] = step
	}
	return initialSteps, nil
}
