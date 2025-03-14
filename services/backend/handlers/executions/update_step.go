package executions

import (
	"net/http"

	"github.com/v1Flows/exFlow/services/backend/functions/encryption"
	"github.com/v1Flows/exFlow/services/backend/functions/httperror"
	"github.com/v1Flows/exFlow/services/backend/pkg/models"

	"github.com/gin-gonic/gin"
	"github.com/uptrace/bun"
)

func UpdateStep(context *gin.Context, db *bun.DB) {
	stepID := context.Param("stepID")

	var step models.ExecutionSteps
	if err := context.ShouldBindJSON(&step); err != nil {
		httperror.StatusBadRequest(context, "Error parsing incoming data", err)
		return
	}

	// get current action messages
	var dbStep models.ExecutionSteps
	err := db.NewSelect().Model(&dbStep).Where("id = ?", stepID).Scan(context)
	if err != nil {
		httperror.InternalServerError(context, "Error collecting current step messages from db", err)
		return
	}

	// get parent execution data
	var execution models.Executions
	err = db.NewSelect().Model(&execution).Column("flow_id").Where("id = ?", dbStep.ExecutionID).Scan(context)
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

	// check for ecryption and decrypt if needed
	if flow.EncryptExecutions && dbStep.Messages != nil && len(dbStep.Messages) > 0 {
		dbStep.Messages, err = encryption.DecryptExecutionStepActionMessage(dbStep.Messages)
		if err != nil {
			httperror.InternalServerError(context, "Error decrypting execution step action messages", err)
			return
		}
	}

	// append new message to existing
	step.Messages = append(dbStep.Messages, step.Messages...)

	if step.StartedAt.IsZero() {
		step.StartedAt = dbStep.StartedAt
	}

	if step.RunnerID == "" {
		step.RunnerID = dbStep.RunnerID
	}

	// check for ecryption and encrypt if needed
	if flow.EncryptExecutions && step.Messages != nil && len(step.Messages) > 0 {
		step.Messages, err = encryption.EncryptExecutionStepActionMessage(step.Messages)
		if err != nil {
			httperror.InternalServerError(context, "Error encrypting execution step action messages", err)
			return
		}

		step.Encrypted = true
	}

	_, err = db.NewUpdate().Model(&step).ExcludeColumn("id", "execution_id", "action", "created_at").Where("id = ?", stepID).Exec(context)
	if err != nil {
		httperror.InternalServerError(context, "Error updating step on db", err)
		return
	}

	context.JSON(http.StatusOK, gin.H{"result": "success"})
}
