package flows

import (
	"errors"
	"net/http"
	"time"

	"github.com/v1Flows/exFlow/services/backend/functions/gatekeeper"
	"github.com/v1Flows/exFlow/services/backend/functions/httperror"
	functions_project "github.com/v1Flows/exFlow/services/backend/functions/project"
	"github.com/v1Flows/exFlow/services/backend/pkg/models"

	"github.com/gin-gonic/gin"
	_ "github.com/lib/pq"
	log "github.com/sirupsen/logrus"
	"github.com/uptrace/bun"
)

func UpdateFlow(context *gin.Context, db *bun.DB) {
	flowID := context.Param("flowID")

	var flow models.Flows
	if err := context.ShouldBindJSON(&flow); err != nil {
		httperror.StatusBadRequest(context, "Error parsing incoming data", err)
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
	columns := []string{}
	if flow.Name != "" {
		columns = append(columns, "name")
	}
	if flow.Description != "" {
		columns = append(columns, "description")
	}
	if flow.ProjectID != "" {
		columns = append(columns, "project_id")
	}
	if flow.RunnerID != "" {
		columns = append(columns, "runner_id")
	}
	if flow.EncryptActionParams || !flow.EncryptActionParams {
		columns = append(columns, "encrypt_action_params")
	}
	if flow.EncryptExecutions || !flow.EncryptExecutions {
		columns = append(columns, "encrypt_executions")
	}
	columns = append(columns, "updated_at")

	_, err = db.NewUpdate().Model(&flow).Column(columns...).Where("id = ?", flowID).Exec(context)
	if err != nil {
		httperror.InternalServerError(context, "Error updating flow on db", err)
		return
	}

	// Audit
	err = functions_project.CreateAuditEntry(flow.ProjectID, "update", "Flow updated: "+flow.Name, db, context)
	if err != nil {
		log.Error(err)
	}

	context.JSON(http.StatusCreated, gin.H{"result": "success"})
}
