package executions

import (
	"github.com/v1Flows/exFlow/services/backend/functions/gatekeeper"
	"github.com/v1Flows/exFlow/services/backend/functions/httperror"
	"github.com/v1Flows/exFlow/services/backend/pkg/models"
	"errors"
	"net/http"

	"github.com/gin-gonic/gin"
	_ "github.com/lib/pq"
	"github.com/uptrace/bun"
)

func GetExecution(context *gin.Context, db *bun.DB) {
	executionID := context.Param("executionID")

	// get execution
	var execution models.Executions
	err := db.NewSelect().Model(&execution).Where("id = ?", executionID).Scan(context)
	if err != nil {
		httperror.InternalServerError(context, "Error collecting execution data from db", err)
		return
	}

	// get flow
	var flow models.Flows
	err = db.NewSelect().Model(&flow).Where("id = ?", execution.FlowID).Scan(context)
	if err != nil {
		httperror.InternalServerError(context, "Error collecting flow data from db", err)
		return
	}

	// check if user has access to project
	access, err := gatekeeper.CheckUserProjectAccess(flow.ProjectID, context, db)
	if err != nil {
		httperror.InternalServerError(context, "Error checking for flow access", err)
		return
	}
	if !access {
		httperror.Unauthorized(context, "You do not have access to this execution", errors.New("you do not have access to this execution"))
		return
	}

	context.JSON(http.StatusOK, gin.H{"execution": execution})
}
