package background_checks

import (
	"context"
	"time"

	"github.com/v1Flows/exFlow/services/backend/pkg/models"

	log "github.com/sirupsen/logrus"
	"github.com/uptrace/bun"
)

func checkHangingExecutions(db *bun.DB) {
	context := context.Background()

	log.Info("Bot: Checking for hanging executions")

	// get all executions that are not finished
	var executions []models.Executions
	err := db.NewSelect().Model(&executions).Where("status = 'running' AND executed_at < NOW() - INTERVAL '15 minutes'").Scan(context)
	if err != nil {
		log.Error("Bot: Error getting running executions. ", err)
	}

	// get steps for each execution
	for _, execution := range executions {
		var steps []models.ExecutionSteps
		err := db.NewSelect().Model(&steps).Where("execution_id = ?", execution.ID).Scan(context)
		if err != nil {
			log.Error("Bot: Error getting steps for execution", err)
		}

		// check if all steps are finished
		allFinished := true
		for _, step := range steps {
			if step.Status != "finished" {
				allFinished = false
				break
			}
		}

		// check if the last finished step has been finished for at least 15 minutes
		if allFinished {
			lastFinishedStep := steps[len(steps)-1]
			finishedAt := lastFinishedStep.FinishedAt
			if time.Since(finishedAt) < 15*time.Minute {
				allFinished = false
			}
		}

		// if all steps are finished, mark execution as Error
		if allFinished {
			log.Info("Bot: Execution is hanging, marking as error", execution.ID)

			// add an error step
			_, err := db.NewInsert().Model(&models.ExecutionSteps{
				ExecutionID: execution.ID.String(),
				Action: models.Actions{
					Name: "Automated Check",
				},
				Messages: []string{
					"All steps finished since 15 minutes but execution is still running",
					"Marking as error",
				},
				Status:     "error",
				FinishedAt: time.Now(),
			}).Exec(context)
			if err != nil {
				log.Error("Bot: Error adding error step", err)
			}

			_, err = db.NewUpdate().Model(&execution).Set("status = 'running'").Set("error = ?", true).Set("finished_at = ?", time.Now()).Where("id = ?", execution.ID).Exec(context)
			if err != nil {
				log.Error("Bot: Error updating execution", err)
			}
		}
	}
}
