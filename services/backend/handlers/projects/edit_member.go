package projects

import (
	"github.com/v1Flows/exFlow/services/backend/functions/gatekeeper"
	"github.com/v1Flows/exFlow/services/backend/functions/httperror"
	functions_project "github.com/v1Flows/exFlow/services/backend/functions/project"
	"github.com/v1Flows/exFlow/services/backend/pkg/models"
	"errors"
	"net/http"

	"github.com/gin-gonic/gin"
	_ "github.com/lib/pq"
	log "github.com/sirupsen/logrus"
	"github.com/uptrace/bun"
)

func EditProjectMember(context *gin.Context, db *bun.DB) {
	projectID := context.Param("projectID")

	var member models.ProjectMembers
	if err := context.ShouldBindJSON(&member); err != nil {
		httperror.StatusBadRequest(context, "Error parsing incoming data", err)
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

	_, err = db.NewUpdate().Model(&member).Column("role").Where("user_id = ?", member.UserID).Where("project_id = ?", projectID).Exec(context)
	if err != nil {
		httperror.InternalServerError(context, "Error updating target user informations on db", err)
		return
	}

	// get user details
	var user models.Users
	err = db.NewSelect().Model(&user).Where("id = ?", member.UserID).Scan(context)
	if err != nil {
		httperror.InternalServerError(context, "Error receiving target user informations from db", err)
		return
	}

	// Audit
	err = functions_project.CreateAuditEntry(projectID, "update", user.Username+" Role got changed to "+member.Role, db, context)
	if err != nil {
		log.Error(err)
	}

	context.JSON(http.StatusOK, gin.H{"result": "success"})
}
