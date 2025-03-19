package executions

import (
	"github.com/v1Flows/exFlow/services/backend/functions/gatekeeper"
	"github.com/v1Flows/exFlow/services/backend/functions/httperror"
	"github.com/v1Flows/exFlow/services/backend/pkg/models"
	"errors"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/uptrace/bun"
)

func DeleteExecution(context *gin.Context, db *bun.DB) {
	executionID := context.Param("executionID")

	// get execution from db
	var execution models.Executions
	err := db.NewSelect().Model(&execution).Where("id = ?", executionID).Scan(context)
	if err != nil {
		httperror.InternalServerError(context, "Error collecting execution data from db", err)
		return
	}

	// get flow from db
	var flow models.Flows
	err = db.NewSelect().Model(&flow).Where("id = ?", execution.FlowID).Scan(context)
	if err != nil {
		httperror.InternalServerError(context, "Error collecting flow data from db", err)
		return
	}

	// check the requestors role in project
	canModify, err := gatekeeper.CheckRequestUserProjectModifyRole(flow.ProjectID, context, db)
	if err != nil {
		httperror.InternalServerError(context, "Error checking your user permissions on project", err)
		return
	}
	if !canModify {
		httperror.Unauthorized(context, "You are not allowed to make modifications on this project", errors.New("unauthorized"))
		return
	}

	_, err = db.NewDelete().Model((*models.Executions)(nil)).Where("id = ?", executionID).Exec(context)
	if err != nil {
		httperror.InternalServerError(context, "Error deleting execution on db", err)
		return
	}

	// delete all related execution steps
	_, err = db.NewDelete().Model((*models.ExecutionSteps)(nil)).Where("execution_id = ?", executionID).Exec(context)
	if err != nil {
		httperror.InternalServerError(context, "Error deleting execution steps on db", err)
		return
	}

	context.JSON(http.StatusOK, gin.H{"result": "success"})
}
