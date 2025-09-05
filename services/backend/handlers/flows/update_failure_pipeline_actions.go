package flows

import (
	"errors"
	"net/http"

	"github.com/v1Flows/exFlow/services/backend/functions/encryption"
	"github.com/v1Flows/exFlow/services/backend/functions/gatekeeper"
	"github.com/v1Flows/exFlow/services/backend/functions/httperror"
	functions_project "github.com/v1Flows/exFlow/services/backend/functions/project"
	"github.com/v1Flows/exFlow/services/backend/pkg/models"

	"github.com/gin-gonic/gin"
	_ "github.com/lib/pq"
	log "github.com/sirupsen/logrus"
	"github.com/uptrace/bun"
)

func UpdateFlowFailurePipelineActions(context *gin.Context, db *bun.DB) {
	flowID := context.Param("flowID")
	failurePipelineID := context.Param("failurePipelineID")

	var failurePipeline models.FailurePipeline
	if err := context.ShouldBindJSON(&failurePipeline); err != nil {
		httperror.StatusBadRequest(context, "Error parsing incoming data", err)
		return
	}

	// get flow
	var flowDB models.Flows
	err := db.NewSelect().Model(&flowDB).Where("id = ?", flowID).Scan(context)
	if err != nil {
		httperror.InternalServerError(context, "Error collecting flow data from db", err)
		return
	}

	// get project data
	var project models.Projects
	err = db.NewSelect().Model(&project).Where("id = ?", flowDB.ProjectID).Scan(context)
	if err != nil {
		httperror.InternalServerError(context, "Error collecting project data from db", err)
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

	// encrypt action params
	if project.EncryptionEnabled {
		failurePipeline.Actions, err = encryption.EncryptParamsWithProject(failurePipeline.Actions, project.ID.String(), db)
		if err != nil {
			httperror.InternalServerError(context, "Error encrypting action params", err)
			return
		}
	}

	for a, action := range failurePipeline.Actions {
		if action.UpdateAvailable && action.Version == action.UpdateVersion {
			action.UpdateAvailable = false
			action.UpdateVersion = ""
			action.UpdatedAction = nil

			failurePipeline.Actions[a] = action
		}
	}

	// set the updated actions
	for i, pipeline := range flowDB.FailurePipelines {
		if pipeline.ID.String() == failurePipelineID {
			flowDB.FailurePipelines[i].Actions = failurePipeline.Actions
		}
	}

	_, err = db.NewUpdate().Model(&flowDB).Set("failure_pipelines = ?", flowDB.FailurePipelines).Where("id = ?", flowID).Exec(context)
	if err != nil {
		httperror.InternalServerError(context, "Error adding action to flow on db. "+err.Error(), err)
		return
	}

	// Audit
	err = functions_project.CreateAuditEntry(flowDB.ProjectID, "update", "Flow Failure Pipeline actions updated", db, context)
	if err != nil {
		log.Error(err)
	}

	context.JSON(http.StatusCreated, gin.H{"result": "success"})
}
