package executions

import (
	"errors"
	"net/http"

	log "github.com/sirupsen/logrus"
	"github.com/JustLABv1/justflow/apps/backend/functions/encryption"
	"github.com/JustLABv1/justflow/apps/backend/functions/httperror"
	"github.com/JustLABv1/justflow/apps/backend/pkg/models"

	"github.com/gin-gonic/gin"
	"github.com/uptrace/bun"
)

func UpdateStep(context *gin.Context, db *bun.DB) {
	stepID := context.Param("stepID")

	var step models.ExecutionSteps
	if err := context.ShouldBindJSON(&step); err != nil {
		httperror.StatusBadRequest(context, "Error parsing incoming data", err)
		log.Error("Error parsing incoming data", err)
		return
	}

	if err := models.ValidateStepStatus(step.Status); err != nil {
		httperror.StatusBadRequest(context, err.Error(), err)
		return
	}

	// get current action messages
	var dbStep models.ExecutionSteps
	err := db.NewSelect().Model(&dbStep).Where("id = ?", stepID).Scan(context)
	if err != nil {
		httperror.InternalServerError(context, "Error collecting current step messages from db", err)
		log.Error("Error collecting current step messages from db", err)
		return
	}

	// get parent execution data
	var execution models.Executions
	err = db.NewSelect().Model(&execution).Column("flow_id").Where("id = ?", dbStep.ExecutionID).Scan(context)
	if err != nil {
		httperror.InternalServerError(context, "Error fetching parent execution data", err)
		log.Error("Error fetching parent execution data", err)
		return
	}
	// get flow data
	var flow models.Flows
	err = db.NewSelect().Model(&flow).Where("id = ?", execution.FlowID).Scan(context)
	if err != nil {
		httperror.InternalServerError(context, "Error fetching flow data", err)
		log.Error("Error fetching flow data", err)
		return
	}
	// get project data
	var project models.Projects
	err = db.NewSelect().Model(&project).Where("id = ?", flow.ProjectID).Scan(context)
	if err != nil {
		httperror.InternalServerError(context, "Error collecting project data from db", err)
		return
	}

	// check for ecryption and decrypt if needed
	if project.EncryptionEnabled && dbStep.Messages != nil && len(dbStep.Messages) > 0 {
		dbStep.Messages, err = encryption.DecryptExecutionStepActionMessageWithProject(dbStep.Messages, project.ID.String(), db)
		if err != nil {
			httperror.InternalServerError(context, "Error decrypting execution step action messages", err)
			log.Error("Error decrypting execution step action messages", err)
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
	if project.EncryptionEnabled && step.Messages != nil && len(step.Messages) > 0 {
		step.Messages, err = encryption.EncryptExecutionStepActionMessageWithProject(step.Messages, project.ID.String(), db)
		if err != nil {
			httperror.InternalServerError(context, "Error encrypting execution step action messages", err)
			log.Error("Error encrypting execution step action messages", err)
			return
		}

		step.Encrypted = true
	}

	if step.Status == "" {
		step.Status = dbStep.Status
	}

	// Optimistic concurrency: include the version we read in the WHERE clause,
	// then increment it. If another writer updated the row first, 0 rows are affected.
	currentVersion := dbStep.Version
	step.Version = currentVersion + 1

	res, err := db.NewUpdate().Model(&step).
		ExcludeColumn("id", "execution_id", "action", "created_at").
		Where("id = ? AND version = ?", stepID, currentVersion).
		Exec(context)
	if err != nil {
		httperror.InternalServerError(context, "Error updating step on db", err)
		log.Error("Error updating step on db", err)
		return
	}

	rowsAffected, err := res.RowsAffected()
	if err != nil {
		httperror.InternalServerError(context, "Error checking rows affected", err)
		return
	}
	if rowsAffected == 0 {
		httperror.StatusConflict(context, "Step was modified by another request; please retry", errors.New("optimistic concurrency conflict on execution step"))
		return
	}

	context.JSON(http.StatusOK, gin.H{"result": "success"})
}
