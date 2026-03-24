package projects

import (
	"errors"
	"net/http"

	"github.com/JustLABv1/justflow/apps/backend/functions/encryption"
	"github.com/JustLABv1/justflow/apps/backend/functions/gatekeeper"
	"github.com/JustLABv1/justflow/apps/backend/functions/httperror"
	functions_project "github.com/JustLABv1/justflow/apps/backend/functions/project"
	"github.com/JustLABv1/justflow/apps/backend/pkg/models"

	"github.com/gin-gonic/gin"
	_ "github.com/lib/pq"
	log "github.com/sirupsen/logrus"
	"github.com/uptrace/bun"
)

func UpdateProjectActions(context *gin.Context, db *bun.DB) {
	projectID := context.Param("projectID")

	var project models.Projects
	if err := context.ShouldBindJSON(&project); err != nil {
		httperror.StatusBadRequest(context, "Error parsing incoming data", err)
		return
	}

	// get project
	var projectDB models.Projects
	err := db.NewSelect().Model(&projectDB).Where("id = ?", projectID).Scan(context)
	if err != nil {
		httperror.InternalServerError(context, "Error collecting project data from db", err)
		return
	}

	// check if user has access to project
	access, err := gatekeeper.CheckUserProjectAccess(projectID, context, db)
	if err != nil {
		httperror.InternalServerError(context, "Error checking for project access", err)
		return
	}
	if !access {
		httperror.Unauthorized(context, "You do not have access to this project", errors.New("you do not have access to this project"))
		return
	}

	// check the requestors role in project
	canModify, err := gatekeeper.CheckRequestUserProjectModifyRole(projectID, context, db)
	if err != nil {
		httperror.InternalServerError(context, "Error checking your user permissions on project", err)
		return
	}
	if !canModify {
		httperror.Unauthorized(context, "You are not allowed to make modifications on this project", errors.New("unauthorized"))
		return
	}

	// encrypt action params
	if projectDB.EncryptionEnabled {
		project.PredefinedFlowActions, err = encryption.EncryptParamsWithProject(project.PredefinedFlowActions, projectID, db)
		if err != nil {
			httperror.InternalServerError(context, "Error encrypting action params", err)
			return
		}
	}

	_, err = db.NewUpdate().Model(&project).Set("predefined_flow_actions = ?", project.PredefinedFlowActions).Where("id = ?", projectID).Exec(context)
	if err != nil {
		httperror.InternalServerError(context, "Error updating action on db", err)
		return
	}

	// Audit
	err = functions_project.CreateAuditEntry(projectID, "update", "Project predefined actions updated", db, context)
	if err != nil {
		log.Error(err)
	}

	context.JSON(http.StatusCreated, gin.H{"result": "success"})
}
