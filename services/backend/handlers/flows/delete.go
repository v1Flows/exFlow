package flows

import (
	"errors"
	"net/http"

	"github.com/v1Flows/exFlow/services/backend/functions/gatekeeper"
	"github.com/v1Flows/exFlow/services/backend/functions/httperror"
	functions_project "github.com/v1Flows/exFlow/services/backend/functions/project"
	"github.com/v1Flows/exFlow/services/backend/pkg/models"

	"github.com/gin-gonic/gin"
	_ "github.com/lib/pq"
	log "github.com/sirupsen/logrus"
	"github.com/uptrace/bun"
)

func DeleteFlow(context *gin.Context, db *bun.DB) {
	flowID := context.Param("flowID")

	var flow models.Flows
	err := db.NewSelect().Model(&flow).Where("id = ?", flowID).Scan(context)
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

	_, err = db.NewDelete().Model((*models.Flows)(nil)).Where("id = ?", flowID).Exec(context)
	if err != nil {
		httperror.InternalServerError(context, "Error deleting flow from db", err)
		return
	}

	// delete all executions linked to the flow
	_, err = db.NewDelete().Model((*models.Executions)(nil)).Where("flow_id = ?", flowID).Exec(context)
	if err != nil {
		httperror.InternalServerError(context, "Error deleting flow executions from db", err)
		return
	}

	// Audit
	err = functions_project.CreateAuditEntry(flow.ProjectID, "delete", "Flow deleted: "+flow.Name, db, context)
	if err != nil {
		log.Error(err)
	}

	context.JSON(http.StatusOK, gin.H{"result": "success"})
}
