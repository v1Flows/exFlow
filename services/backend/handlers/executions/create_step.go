package executions

import (
	"net/http"
	"time"

	"github.com/v1Flows/exFlow/services/backend/functions/encryption"
	"github.com/v1Flows/exFlow/services/backend/functions/httperror"
	"github.com/v1Flows/exFlow/services/backend/pkg/models"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"github.com/uptrace/bun"
)

func CreateStep(context *gin.Context, db *bun.DB) {
	var step models.ExecutionSteps
	if err := context.ShouldBindJSON(&step); err != nil {
		httperror.StatusBadRequest(context, "Error parsing incoming data", err)
		return
	}

	// get parent execution data
	var execution models.Executions
	err := db.NewSelect().Model(&execution).Column("flow_id").Where("id = ?", step.ExecutionID).Scan(context)
	if err != nil {
		httperror.InternalServerError(context, "Error fetching parent execution data", err)
		return
	}
	// get flow data
	var flow models.Flows
	err = db.NewSelect().Model(&flow).Where("id = ?", execution.FlowID).Scan(context)
	if err != nil {
		httperror.InternalServerError(context, "Error fetching flow data", err)
		return
	}

	// check for encryption
	if flow.EncryptExecutions && step.Messages != nil && len(step.Messages) > 0 {
		step.Messages, err = encryption.EncryptExecutionStepActionMessage(step.Messages)
		if err != nil {
			httperror.InternalServerError(context, "Error encrypting execution step action messages", err)
			return
		}

		step.Encrypted = true
	}

	step.ID = uuid.New()
	step.CreatedAt = time.Now()
	_, err = db.NewInsert().Model(&step).Exec(context)
	if err != nil {
		httperror.InternalServerError(context, "Error creating execution step on db", err)
		return
	}

	context.JSON(http.StatusCreated, gin.H{"result": "success", "id": step.ID})
}
