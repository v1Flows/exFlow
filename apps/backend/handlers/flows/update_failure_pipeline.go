package flows

import (
	"errors"
	"net/http"
	"time"

	"github.com/JustLABv1/justflow/services/backend/functions/encryption"
	"github.com/JustLABv1/justflow/services/backend/functions/gatekeeper"
	"github.com/JustLABv1/justflow/services/backend/functions/httperror"
	functions_project "github.com/JustLABv1/justflow/services/backend/functions/project"
	"github.com/JustLABv1/justflow/services/backend/pkg/models"

	"github.com/gin-gonic/gin"
	_ "github.com/lib/pq"
	log "github.com/sirupsen/logrus"
	"github.com/uptrace/bun"
)

func UpdateFlowFailurePipelines(context *gin.Context, db *bun.DB) {
	flowID := context.Param("flowID")

	var flow models.Flows
	if err := context.ShouldBindJSON(&flow); err != nil {
		httperror.StatusBadRequest(context, "Error parsing incoming data", err)
		return
	}

	// get flow from db
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
	access, err := gatekeeper.CheckUserProjectAccess(flow.ProjectID, context, db)
	if err != nil {
		httperror.InternalServerError(context, "Error checking for flow access", err)
		return
	}
	if !access {
		httperror.Unauthorized(context, "You do not have access to this flow", errors.New("you do not have access to this flow"))
		return
	}

	// check the requestors role in project
	canModify, err := gatekeeper.CheckRequestUserProjectModifyRole(flow.ProjectID, context, db)
	if err != nil {
		httperror.InternalServerError(context, "Error checking your user permissions on flow", err)
		return
	}
	if !canModify {
		httperror.Unauthorized(context, "You are not allowed to make modifications on this flow", errors.New("unauthorized"))
		return
	}

	flow.UpdatedAt = time.Now()

	// encrypt the actions for each failure pipeline
	if project.EncryptionEnabled {
		for i := range flow.FailurePipelines {
			if flow.FailurePipelines[i].Actions != nil {
				flow.FailurePipelines[i].Actions, err = encryption.EncryptParamsWithProject(flow.FailurePipelines[i].Actions, project.ID.String(), db)
				if err != nil {
					httperror.InternalServerError(context, "Error encrypting actions", err)
					return
				}
			}
		}
	}

	_, err = db.NewUpdate().Model(&flow).Column("updated_at", "failure_pipelines").Where("id = ?", flowID).Exec(context)
	if err != nil {
		httperror.InternalServerError(context, "Error updating flow failure pipelines on db", err)
		return
	}

	// Audit
	err = functions_project.CreateAuditEntry(flow.ProjectID, "update", "Flow Failure Pipelines updated", db, context)
	if err != nil {
		log.Error(err)
	}

	context.JSON(http.StatusOK, gin.H{"result": "success"})
}
