package executions

import (
	"net/http"

	"github.com/v1Flows/exFlow/services/backend/functions/encryption"
	"github.com/v1Flows/exFlow/services/backend/functions/httperror"
	"github.com/v1Flows/exFlow/services/backend/pkg/models"

	"github.com/gin-gonic/gin"
	"github.com/uptrace/bun"
)

func GetSteps(context *gin.Context, db *bun.DB) {
	executionID := context.Param("executionID")

	steps := make([]models.ExecutionSteps, 0)
	err := db.NewSelect().Model(&steps).Where("execution_id = ?", executionID).Order("created_at ASC").Order("started_at DESC").Scan(context)
	if err != nil {
		httperror.InternalServerError(context, "Error collecting execution steps from db", err)
		return
	}

	// get execution data
	var execution models.Executions
	err = db.NewSelect().Model(&execution).Where("id = ?", executionID).Scan(context)
	if err != nil {
		httperror.InternalServerError(context, "Error fetching execution data", err)
		return
	}

	// get flow data
	var flow models.Flows
	err = db.NewSelect().Model(&flow).Where("id = ?", execution.FlowID).Scan(context)
	if err != nil {
		httperror.InternalServerError(context, "Error fetching flow data", err)
		return
	}

	for i := range steps {
		if steps[i].Encrypted {
			steps[i].Messages, err = encryption.DecryptExecutionStepActionMessageWithProject(steps[i].Messages, flow.ProjectID, db)
			if err != nil {
				httperror.InternalServerError(context, "Error decrypting execution step action messages", err)
				return
			}
		}
	}

	context.JSON(http.StatusOK, gin.H{"steps": steps})
}
