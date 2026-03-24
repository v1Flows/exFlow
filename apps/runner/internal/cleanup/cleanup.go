package cleanup

import (
	"fmt"
	"os"
	"time"

	"github.com/JustLABv1/justflow/pkg/contracts"
	"github.com/JustLABv1/runner/config"
	"github.com/JustLABv1/runner/pkg/executions"
	log "github.com/sirupsen/logrus"
)

func PerformWorkspaceCleanup(cfg *config.Config, execution models.Executions, flow models.Flows, execStatus string) error {
	if flow.AlwaysCleanupWorkspace {
		cleanupStep, err := createCleanupStep(cfg, execution)
		if err != nil {
			return err
		}

		err = cleanup(cfg, execution, cleanupStep)
		if err != nil {
			return err
		}

		return nil
	} else {
		if execStatus == "success" {
			cleanupStep, err := createCleanupStep(cfg, execution)
			if err != nil {
				return err
			}

			err = cleanup(cfg, execution, cleanupStep)
			if err != nil {
				return err
			}

			return nil
		}
	}

	return nil
}

func createCleanupStep(cfg *config.Config, execution models.Executions) (models.ExecutionSteps, error) {
	cleanupStep := models.ExecutionSteps{
		ExecutionID: execution.ID.String(),
		Action: models.Action{
			Name:        "Cleanup Workspace",
			Description: "Cleanup execution workspace directory",
			Version:     "1.0.0",
			Icon:        "hugeicons:clean",
			Category:    "runner",
		},
		Messages: []models.Message{
			{
				Title: "Cleanup Workspace",
				Lines: []models.Line{
					{
						Content:   "Perform workspace cleanup. Path: " + cfg.WorkspaceDir + "/" + execution.ID.String(),
						Timestamp: time.Now(),
						Color:     "success",
					},
				},
			},
		},
		Status:    "running",
		RunnerID:  execution.RunnerID,
		CreatedAt: time.Now(),
		StartedAt: time.Now(),
	}

	stepID, err := executions.SendStep(cfg, execution, cleanupStep)
	if err != nil {
		return models.ExecutionSteps{}, err
	}

	cleanupStep.ID = stepID.ID

	return cleanupStep, nil
}

func cleanup(cfg *config.Config, execution models.Executions, step models.ExecutionSteps) error {
	err := os.RemoveAll(fmt.Sprintf("%s/%s", cfg.WorkspaceDir, execution.ID))
	if err != nil {
		log.Error("Error deleting workspace dir: ", err)

		err = executions.UpdateStep(nil, execution.ID.String(), models.ExecutionSteps{
			ID: step.ID,
			Messages: []models.Message{
				{
					Title: "Cleanup Workspace",
					Lines: []models.Line{
						{
							Content:   "Failed to delete workspace dir: " + err.Error(),
							Timestamp: time.Now(),
							Color:     "danger",
						},
					},
				},
			},
			Status:     "error",
			RunnerID:   execution.RunnerID,
			FinishedAt: time.Now(),
		})
		if err != nil {
			return err
		}
	}

	err = executions.UpdateStep(nil, execution.ID.String(), models.ExecutionSteps{
		ID: step.ID,
		Messages: []models.Message{
			{
				Title: "Cleanup Workspace",
				Lines: []models.Line{
					{
						Content:   "Workspace directory deleted successfully.",
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
		return err
	}

	return nil
}
