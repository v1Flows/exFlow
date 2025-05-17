package background_checks

import (
	"context"
	"time"

	"github.com/v1Flows/exFlow/services/backend/functions/encryption"
	"github.com/v1Flows/exFlow/services/backend/pkg/models"
	shared_models "github.com/v1Flows/shared-library/pkg/models"

	log "github.com/sirupsen/logrus"
	"github.com/uptrace/bun"
)

func checkScheduledExecutions(db *bun.DB) {
	context := context.Background()

	log.Info("Bot: Checking for scheduled executions")

	// get all executions that reached the scheduled time
	var executions []models.Executions
	err := db.NewSelect().Model(&executions).Where("status = 'scheduled' AND scheduled_at <= NOW()").Scan(context)
	if err != nil {
		log.Error("Bot: Error getting scheduled executions. ", err)
	}

	// get steps for each execution
	for _, execution := range executions {
		// get flow data
		var flow models.Flows
		err = db.NewSelect().Model(&flow).Where("id = ?", execution.FlowID).Scan(context)
		if err != nil {
			log.Error("Bot: Error getting flow data", err)
		}

		// update the scheduled step to success
		var steps []models.ExecutionSteps
		err = db.NewSelect().Model(&steps).Where("execution_id = ?", execution.ID).Scan(context)
		if err != nil {
			log.Error("Bot: Error getting steps for execution", err)
		}

		// mark all steps as canceled if they are not finished
		for _, step := range steps {
			if step.Action.Name == "Scheduled" {
				step.Status = "success"
				step.FinishedAt = time.Now()

				// check for encryption
				if flow.EncryptExecutions && step.Messages != nil && len(step.Messages) > 0 {
					step.Messages, err = encryption.DecryptExecutionStepActionMessage(step.Messages)
					if err != nil {
						log.Error("Bot: Error encrypting execution step action messages", err)
					}

					step.Encrypted = true
				}

				step.Messages = append(step.Messages, shared_models.Message{
					Title: "Scheduled",
					Lines: []shared_models.Line{
						{
							Content:   "Scheduled time reached. Execution is now starting.",
							Color:     "success",
							Timestamp: time.Now(),
						},
					},
				})

				// check for encryption
				if flow.EncryptExecutions && step.Messages != nil && len(step.Messages) > 0 {
					step.Messages, err = encryption.EncryptExecutionStepActionMessage(step.Messages)
					if err != nil {
						log.Error("Bot: Error encrypting execution step action messages", err)
					}

					step.Encrypted = true
				}

				_, err = db.NewUpdate().Model(&step).Set("status = ?, finished_at = ?, messages = ?", step.Status, step.FinishedAt, step.Messages).Where("id = ?", step.ID).Exec(context)
				if err != nil {
					log.Error("Bot: Error updating step", err)
				}

				// create execution step which tells that the execution is registerd and waiting for runner to pick it up
				step := shared_models.ExecutionSteps{
					ExecutionID: execution.ID.String(),
					Action: shared_models.Action{
						Name: "Pick Up",
						Icon: "hugeicons:rocket",
					},
					Messages: []shared_models.Message{
						{
							Title: "Pick Up",
							Lines: []shared_models.Line{
								{
									Content:   "Waiting for runner to pick it up",
									Timestamp: time.Now(),
								},
							},
						},
					},
					Status:    "running",
					CreatedAt: time.Now(),
					StartedAt: time.Now(),
				}

				// check for encryption
				if flow.EncryptExecutions && step.Messages != nil && len(step.Messages) > 0 {
					step.Messages, err = encryption.EncryptExecutionStepActionMessage(step.Messages)
					if err != nil {
						log.Error("Bot: Error encrypting execution step action messages", err)
					}

					step.Encrypted = true
				}

				_, err = db.NewInsert().Model(&step).Exec(context)
				if err != nil {
					log.Error("Bot: Error adding error step", err)
				}
			}
		}

		_, err = db.NewUpdate().Model(&execution).Set("status = 'pending'").Where("id = ?", execution.ID).Exec(context)
		if err != nil {
			log.Error("Bot: Error updating execution", err)
		}
	}
}
