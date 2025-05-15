package executions

import (
	"net/http"

	"github.com/v1Flows/exFlow/services/backend/functions/auth"
	"github.com/v1Flows/exFlow/services/backend/functions/httperror"
	"github.com/v1Flows/exFlow/services/backend/pkg/models"

	"github.com/gin-gonic/gin"
	"github.com/uptrace/bun"
)

func GetPendingExecutions(context *gin.Context, db *bun.DB) {
	_, projectID, _, err := auth.GetRunnerDataFromToken(context.GetHeader("Authorization"))
	if err != nil {
		httperror.Unauthorized(context, "Error receiving runner data from token", err)
		return
	}

	runnerID := context.Param("runnerID")

	// get runner data is assigned to
	var runner models.Runners
	err = db.NewSelect().Model(&runner).Where("id = ?", runnerID).Scan(context)
	if err != nil {
		httperror.InternalServerError(context, "Error collecting runner data on db", err)
		return
	}

	executions := make([]models.Executions, 0)

	tx, err := db.Begin()
	if err != nil {
		httperror.InternalServerError(context, "Error starting transaction", err)
		return
	}
	defer tx.Rollback()

	if !runner.SharedRunner {
		err = tx.NewSelect().Model(&executions).Where("flow_id::text IN (SELECT id::text FROM flows WHERE project_id = ?)", projectID).Where("(status = 'pending' OR (status = 'scheduled' AND scheduled_at <= NOW())) AND runner_id = ''").For("UPDATE").Limit(1).Scan(context)
		if err != nil {
			httperror.InternalServerError(context, "Error collecting executions from db", err)
			return
		}

		// check if the flow where the execution is assigned to has an exclusive runner assigned
		for _, execution := range executions {
			var flow models.Flows
			err = tx.NewSelect().Model(&flow).Where("id = ?", execution.FlowID).Scan(context)
			if err != nil {
				httperror.InternalServerError(context, "Error collecting flow data on db", err)
				return
			}

			if flow.RunnerID != "any" {
				// if the flow has an exclusive runner assigned, check if it is the same as the current one and if not, remove it from the executions list
				if flow.RunnerID != runnerID {
					executions = removeExecution(executions, execution.ID.String())
				}
			} else {
				continue
			}
		}

	} else {
		err = tx.NewSelect().Model(&executions).Where("(status = 'pending' OR (status = 'scheduled' AND scheduled_at <= NOW())) AND runner_id = ''").For("UPDATE").Limit(1).Scan(context)
		if err != nil {
			httperror.InternalServerError(context, "Error collecting executions from db", err)
			return
		}

		// check if the flow where the execution is assigned to has an exclusive runner assigned
		for _, execution := range executions {
			var flow models.Flows
			err = tx.NewSelect().Model(&flow).Where("id = ?", execution.FlowID).Scan(context)
			if err != nil {
				httperror.InternalServerError(context, "Error collecting flow data on db", err)
				return
			}

			if flow.RunnerID != "any" {
				// if the flow has an exclusive runner assigned, check if it is the same as the current one and if not, remove it from the executions list
				if flow.RunnerID != runnerID {
					executions = removeExecution(executions, execution.ID.String())
				}
			}

			// check if project shared_runners are enabled
			var project models.Projects
			err = tx.NewSelect().Model(&project).Where("id = ?", flow.ProjectID).Scan(context)
			if err != nil {
				httperror.InternalServerError(context, "Error collecting project data on db", err)
				return
			}

			if project.SharedRunners {
				continue
			} else {
				executions = removeExecution(executions, execution.ID.String())
			}
		}

	}

	// Update the runner_id of the fetched executions to the current runner's ID
	for i := range executions {
		executions[i].RunnerID = runnerID
		_, err = tx.NewUpdate().Model(&executions[i]).Column("runner_id").Where("id = ?", executions[i].ID).Exec(context)
		if err != nil {
			httperror.InternalServerError(context, "Error updating execution runner_id in db", err)
			return
		}
	}

	if err := tx.Commit(); err != nil {
		httperror.InternalServerError(context, "Error committing transaction", err)
		return
	}

	context.JSON(http.StatusOK, gin.H{"executions": executions})
}

func removeExecution(executions []models.Executions, executionID string) []models.Executions {
	// Create a new slice to hold the filtered executions
	filteredExecutions := make([]models.Executions, 0)

	// Iterate through the executions and exclude the one with the matching ID
	for _, execution := range executions {
		if execution.ID.String() != executionID {
			filteredExecutions = append(filteredExecutions, execution)
		}
	}

	return filteredExecutions
}
