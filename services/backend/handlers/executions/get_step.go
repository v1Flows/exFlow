package executions

import (
	"github.com/v1Flows/exFlow/services/backend/functions/encryption"
	"github.com/v1Flows/exFlow/services/backend/functions/httperror"
	"github.com/v1Flows/exFlow/services/backend/pkg/models"
	"net/http"

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

	if step.Encrypted {
		step.Messages, err = encryption.DecryptExecutionStepActionMessage(step.Messages)
		if err != nil {
			httperror.InternalServerError(context, "Error decrypting execution step action messages", err)
			return
		}
	}

	context.JSON(http.StatusOK, gin.H{"step": step})
}
