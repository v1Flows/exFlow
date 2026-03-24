package executions

import (
	"net/http"

	"github.com/JustLABv1/justflow/services/backend/functions/encryption"
	"github.com/JustLABv1/justflow/services/backend/functions/httperror"
	"github.com/JustLABv1/justflow/services/backend/pkg/models"

	"github.com/gin-gonic/gin"
	"github.com/uptrace/bun"
)

func GetStep(context *gin.Context, db *bun.DB) {
	executionID := context.Param("executionID")
	stepID := context.Param("stepID")

	step := models.ExecutionSteps{}
	err := db.NewSelect().Model(&step).Where("execution_id = ? AND id = ?", executionID, stepID).Scan(context)
	if err != nil {
		httperror.InternalServerError(context, "Error collecting execution step from db", err)
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

	if step.Encrypted {
		step.Messages, err = encryption.DecryptExecutionStepActionMessageWithProject(step.Messages, flow.ProjectID, db)
		if err != nil {
			httperror.InternalServerError(context, "Error decrypting execution step action messages", err)
			return
		}
	}

	context.JSON(http.StatusOK, gin.H{"step": step})
}
