package background_checks

import (
	"context"
	"time"

	"github.com/JustLABv1/justflow/services/backend/functions/encryption"
	"github.com/JustLABv1/justflow/services/backend/pkg/models"

	log "github.com/sirupsen/logrus"
	"github.com/uptrace/bun"
)

func checkHangingExecutionSteps(db *bun.DB) {
	context := context.Background()

	log.Info("Bot: Checking for hanging execution steps")

	// get all executions that are not finished
	var steps []models.ExecutionSteps
	err := db.NewSelect().Model(&steps).Where("status IN ('running', 'paused', 'interactionWaiting')").Scan(context)
	if err != nil {
		log.Error("Bot: Error receiving running execution steps. ", err)
	}

	// get steps for each execution
	for _, step := range steps {
		// get the execution and check for the status
		var execution models.Executions
		err = db.NewSelect().Model(&execution).Where("id = ?", step.ExecutionID).Scan(context)
		if err != nil {
			log.Error("Bot: Error getting execution for step ", step.ID, err)
			continue
		}

		// get the flow
		var flow models.Flows
		err = db.NewSelect().Model(&flow).Where("id = ?", execution.FlowID).Scan(context)
		if err != nil {
			log.Error("Bot: Error getting flow data for execution ", execution.ID, err)
			continue
		}

		// get project data
		var project models.Projects
		err = db.NewSelect().Model(&project).Where("id = ?", flow.ProjectID).Scan(context)
		if err != nil {
			log.Error("Bot: Error getting project data for flow ", flow.ID, err)
			continue
		}

		// if the execution is finished, let the step fail
		if execution.Status == "success" || execution.Status == "error" || execution.Status == "canceled" || execution.Status == "noPatternMatch" || execution.Status == "recovered" {
			// check for encryption and decrypt messages
			if project.EncryptionEnabled && step.Messages != nil && len(step.Messages) > 0 {
				step.Messages, err = encryption.DecryptExecutionStepActionMessageWithProject(step.Messages, project.ID.String(), db)
				if err != nil {
					log.Error("Bot: Error encrypting execution step action messages", err)
					continue
				}

				step.Encrypted = true
			}

			step.Status = "error"
			step.FinishedAt = time.Now()
			step.Messages = append(step.Messages, models.Message{
				Title: "Automated Check",
				Lines: []models.Line{
					{
						Content:   "Execution is already finished, marking step as error",
						Color:     "danger",
						Timestamp: time.Now(),
					},
				},
			})

			// check for encryption and encrypt messages
			if project.EncryptionEnabled && step.Messages != nil && len(step.Messages) > 0 {
				step.Messages, err = encryption.EncryptExecutionStepActionMessageWithProject(step.Messages, project.ID.String(), db)
				if err != nil {
					log.Error("Bot: Error encrypting execution step action messages", err)
					continue
				}

				step.Encrypted = true
			}

			_, err := db.NewUpdate().Model(&step).Column("status", "encrypted", "messages", "finished_at").Where("id = ?", step.ID).Exec(context)
			if err != nil {
				log.Error("Bot: Error updating step", err)
				continue
			}

			// set execution status to error if it is not already set
			if execution.Status != "error" {
				execution.Status = "error"

				if execution.FinishedAt.IsZero() {
					execution.FinishedAt = time.Now()
				}

				_, err := db.NewUpdate().Model(&execution).Column("status", "finished_at").Where("id = ?", execution.ID).Exec(context)
				if err != nil {
					log.Error("Bot: Error updating execution status to error", err)
					continue
				}
			}
			continue
		}
	}
}
