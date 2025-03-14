package projects

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

func DeleteProject(context *gin.Context, db *bun.DB) {
	projectID := context.Param("projectID")

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

	_, err = db.NewDelete().Model(&models.Projects{}).Where("id = ?", projectID).Exec(context)
	if err != nil {
		httperror.InternalServerError(context, "Error deleting project on db", err)
		return
	}

	// delete all project members linked to the project
	_, err = db.NewDelete().Model(&models.ProjectMembers{}).Where("project_id = ?", projectID).Exec(context)
	if err != nil {
		httperror.InternalServerError(context, "Error deleting project members on db", err)
		return
	}

	// delete all self_hosted runners linked to the project
	_, err = db.NewDelete().Model(&models.Runners{}).Where("project_id = ?", projectID).Exec(context)
	if err != nil {
		httperror.InternalServerError(context, "Error deleting project runners on db", err)
		return
	}

	// delete all flows linked to the project
	_, err = db.NewDelete().Model(&models.Flows{}).Where("project_id = ?", projectID).Exec(context)
	if err != nil {
		httperror.InternalServerError(context, "Error deleting project flows on db", err)
		return
	}

	// delete all tokens linked to the project
	_, err = db.NewDelete().Model(&models.Tokens{}).Where("project_id = ?", projectID).Exec(context)
	if err != nil {
		httperror.InternalServerError(context, "Error deleting project tokens on db", err)
		return
	}

	// delete all audit entrys linked to the project
	_, err = db.NewDelete().Model(&models.Audit{}).Where("project_id = ?", projectID).Exec(context)
	if err != nil {
		httperror.InternalServerError(context, "Error deleting project audit informations on db", err)
		return
	}

	context.JSON(http.StatusOK, gin.H{"result": "success"})
}
