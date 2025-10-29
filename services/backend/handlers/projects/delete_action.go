package projects

import (
	"errors"
	"net/http"

	"github.com/JustLABv1/justflow/services/backend/functions/gatekeeper"
	"github.com/JustLABv1/justflow/services/backend/functions/httperror"
	functions_project "github.com/JustLABv1/justflow/services/backend/functions/project"
	"github.com/JustLABv1/justflow/services/backend/pkg/models"

	"github.com/gin-gonic/gin"
	_ "github.com/lib/pq"
	log "github.com/sirupsen/logrus"
	"github.com/uptrace/bun"
)

func DeleteProjectAction(context *gin.Context, db *bun.DB) {
	projectID := context.Param("projectID")
	actionID := context.Param("actionID")

	// get project
	var project models.Projects
	err := db.NewSelect().Model(&project).Where("id = ?", projectID).Scan(context)
	if err != nil {
		httperror.InternalServerError(context, "Error collecting project data from db", err)
		return
	}

	// check if user has access to project
	access, err := gatekeeper.CheckUserProjectAccess(project.ID.String(), context, db)
	if err != nil {
		httperror.InternalServerError(context, "Error checking for project access", err)
		return
	}
	if !access {
		httperror.Unauthorized(context, "You do not have access to this project", errors.New("you do not have access to this project"))
		return
	}

	// check the requestors role in project
	canModify, err := gatekeeper.CheckRequestUserProjectModifyRole(project.ID.String(), context, db)
	if err != nil {
		httperror.InternalServerError(context, "Error checking your user permissions on project", err)
		return
	}
	if !canModify {
		httperror.Unauthorized(context, "You are not allowed to make modifications on this project", errors.New("unauthorized"))
		return
	}

	// remove the actionID from the project.PredefinedFlowActions where id = actionID
	for i, action := range project.PredefinedFlowActions {
		if action.ID.String() == actionID {
			project.PredefinedFlowActions = append(project.PredefinedFlowActions[:i], project.PredefinedFlowActions[i+1:]...)
			break
		}
	}

	_, err = db.NewUpdate().Model(&project).Set("predefined_flow_actions = ?", project.PredefinedFlowActions).Where("id = ?", project.ID.String()).Exec(context)
	if err != nil {
		httperror.InternalServerError(context, "Error updating project data on db", err)
		return
	}

	err = functions_project.CreateAuditEntry(project.ID.String(), "delete", "Project action deleted", db, context)
	if err != nil {
		log.Error(err)
	}

	context.JSON(http.StatusOK, gin.H{"result": "success"})
}
