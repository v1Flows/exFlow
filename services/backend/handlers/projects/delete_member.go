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

func RemoveProjectMember(context *gin.Context, db *bun.DB) {
	projectID := context.Param("projectID")
	memberID := context.Param("memberID")

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

	var member models.ProjectMembers
	_, err = db.NewDelete().Model(&member).Where("project_id = ? AND user_id = ?", projectID, memberID).Exec(context)
	if err != nil {
		httperror.InternalServerError(context, "Error removing member from project on db", err)
		return
	}

	// get user details
	var user models.Users
	err = db.NewSelect().Model(&user).Where("id = ?", memberID).Scan(context)
	if err != nil {
		httperror.InternalServerError(context, "Error receiving target user informations from db", err)
		return
	}

	// Audit
	err = functions_project.CreateAuditEntry(projectID, "delete", "Member got removed from project: "+user.Username, db, context)
	if err != nil {
		log.Error(err)
	}

	context.JSON(http.StatusOK, gin.H{"result": "success"})
}
