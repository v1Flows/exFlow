package flows

import (
	"errors"
	"fmt"
	"net/http"

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

func AddFlowActions(context *gin.Context, db *bun.DB) {
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
		flow.Actions, err = encryption.EncryptParamsWithProject(flow.Actions, flowDB.ProjectID, db)
		if err != nil {
			httperror.InternalServerError(context, "Error encrypting action params", err)
			fmt.Println(err)
			return
		}
	}

	// update flow with encrypted actions
	_, err = db.NewUpdate().Model(&flow).Set("actions = ?", flow.Actions).Where("id = ?", flowID).Exec(context)
	if err != nil {
		httperror.InternalServerError(context, "Error adding action to flow on db. "+err.Error(), err)
		return
	}

	// Audit
	err = functions_project.CreateAuditEntry(flow.ProjectID, "create", "Flow action added", db, context)
	if err != nil {
		log.Error(err)
	}

	context.JSON(http.StatusOK, gin.H{"result": "success"})
}
