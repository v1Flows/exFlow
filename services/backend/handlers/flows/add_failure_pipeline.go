package flows

import (
	"errors"
	"net/http"

	"github.com/google/uuid"
	"github.com/v1Flows/exFlow/services/backend/functions/gatekeeper"
	"github.com/v1Flows/exFlow/services/backend/functions/httperror"
	functions_project "github.com/v1Flows/exFlow/services/backend/functions/project"
	"github.com/v1Flows/exFlow/services/backend/pkg/models"

	"github.com/gin-gonic/gin"
	_ "github.com/lib/pq"
	log "github.com/sirupsen/logrus"
	"github.com/uptrace/bun"
)

func AddFlowFailurePipelines(context *gin.Context, db *bun.DB) {
	flowID := context.Param("flowID")

	var flow models.Flows
	if err := context.ShouldBindJSON(&flow); err != nil {
		httperror.StatusBadRequest(context, "Error parsing incoming data", err)
		return
	}

	var flowDB models.Flows
	err := db.NewSelect().Model(&flowDB).Where("id = ?", flowID).Scan(context)
	if err != nil {
		httperror.InternalServerError(context, "Error collecting flow data from db", err)
		return
	}

	// check if user has access to project
	access, err := gatekeeper.CheckUserProjectAccess(flowDB.ProjectID, context, db)
	if err != nil {
		httperror.InternalServerError(context, "Error checking for flow access", err)
		return
	}
	if !access {
		httperror.Unauthorized(context, "You do not have access to this flow", errors.New("you do not have access to this flow"))
		return
	}

	// check the requestors role in project
	canModify, err := gatekeeper.CheckRequestUserProjectModifyRole(flowDB.ProjectID, context, db)
	if err != nil {
		httperror.InternalServerError(context, "Error checking your user permissions on flow", err)
		return
	}
	if !canModify {
		httperror.Unauthorized(context, "You are not allowed to make modifications on this flow", errors.New("unauthorized"))
		return
	}

	// create random ID for the failure pipeline
	flow.FailurePipelines[0].ID = uuid.New()

	// merge the inconing failure pipelines with the existing ones
	flowDB.FailurePipelines = append(flowDB.FailurePipelines, flow.FailurePipelines...)

	// update flow with encrypted actions
	_, err = db.NewUpdate().Model(&flow).Set("failure_pipelines = ?", flowDB.FailurePipelines).Where("id = ?", flowID).Exec(context)
	if err != nil {
		httperror.InternalServerError(context, "Error creating failure pipeline for flow on db. "+err.Error(), err)
		return
	}

	// Audit
	err = functions_project.CreateAuditEntry(flow.ProjectID, "create", "Flow failure pipeline added", db, context)
	if err != nil {
		log.Error(err)
	}

	context.JSON(http.StatusCreated, gin.H{"result": "success"})
}
