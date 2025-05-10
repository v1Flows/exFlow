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

func checkHangingExecutions(db *bun.DB) {
	context := context.Background()

	log.Info("Bot: Checking for hanging executions")

	// get all executions that are not finished
	var executions []models.Executions
	err := db.NewSelect().Model(&executions).Where("status NOT IN ('pending', 'canceled', 'noPatternMatch', 'error', 'success', 'recovered')").Scan(context)
	if err != nil {
		log.Error("Bot: Error getting running executions. ", err)
	}

	// get steps for each execution
	for _, execution := range executions {

		// check if the last heartbeat is older than 15 seconds
		if time.Since(execution.LastHeartbeat) > 15*time.Second {
			log.Info("Bot: Execution is hanging, marking as error", execution.ID)

			// get flow data
			var flow models.Flows
			err = db.NewSelect().Model(&flow).Where("id = ?", execution.FlowID).Scan(context)
			if err != nil {
				log.Error("Bot: Error getting flow data", err)
			}

			step := shared_models.ExecutionSteps{
				ExecutionID: execution.ID.String(),
				Action: shared_models.Action{
					Name: "Automated Check",
					Icon: "hugeicons:robotic",
				},
				Messages: []shared_models.Message{
					{
						Title: "Automated Check",
						Lines: []shared_models.Line{
							{
								Content:   "Last execution heartbeat was more than 15 seconds ago",
								Color:     "danger",
								Timestamp: time.Now(),
							},
							{
								Content:   "Execution will be marked as error and all remaining steps will be canceled",
								Color:     "danger",
								Timestamp: time.Now(),
							},
						},
					},
				},
				Status:     "warning",
				CreatedAt:  time.Now(),
				StartedAt:  time.Now(),
				FinishedAt: time.Now(),
			}

			// check for encryption
			if flow.EncryptExecutions && step.Messages != nil && len(step.Messages) > 0 {
				step.Messages, err = encryption.EncryptExecutionStepActionMessage(step.Messages)
				if err != nil {
					log.Error("Bot: Error encrypting execution step action messages", err)
				}

				step.Encrypted = true
			}

			_, err := db.NewInsert().Model(&step).Exec(context)
			if err != nil {
				log.Error("Bot: Error adding error step", err)
			}

			_, err = db.NewUpdate().Model(&execution).Set("status = 'error'").Set("finished_at = ?", time.Now()).Where("id = ?", execution.ID).Exec(context)
			if err != nil {
				log.Error("Bot: Error updating execution", err)
			}

			var steps []models.ExecutionSteps
			err = db.NewSelect().Model(&steps).Where("execution_id = ?", execution.ID).Scan(context)
			if err != nil {
				log.Error("Bot: Error getting steps for execution", err)
			}

			// mark all steps as canceled if they are not finished
			for _, step := range steps {
				if step.FinishedAt.IsZero() {
					step.Status = "canceled"
					step.StartedAt = time.Now()
					step.FinishedAt = time.Now()
					step.CanceledAt = time.Now()
					step.CanceledBy = "Automated Check"
					step.Messages = []shared_models.Message{
						{
							Title: "Automated Check",
							Lines: []shared_models.Line{
								{
									Content:   "Execution was marked as error, step will be canceled",
									Color:     "danger",
									Timestamp: time.Now(),
								},
							},
						},
					}

					// check for encryption
					if flow.EncryptExecutions && step.Messages != nil && len(step.Messages) > 0 {
						step.Messages, err = encryption.EncryptExecutionStepActionMessage(step.Messages)
						if err != nil {
							log.Error("Bot: Error encrypting execution step action messages", err)
						}

						step.Encrypted = true
					}

					_, err := db.NewUpdate().Model(&step).Column("status", "encrypted", "messages", "started_at", "finished_at", "canceled_at", "canceled_by").Where("id = ?", step.ID).Exec(context)
					if err != nil {
						log.Error("Bot: Error updating step", err)
					}
				}
			}
		}
	}
}
