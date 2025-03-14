package projects

import (
	"github.com/v1Flows/exFlow/services/backend/functions/auth"
	"github.com/v1Flows/exFlow/services/backend/functions/httperror"
	functions_project "github.com/v1Flows/exFlow/services/backend/functions/project"
	"github.com/v1Flows/exFlow/services/backend/pkg/models"
	"net/http"

	"github.com/gin-gonic/gin"
	log "github.com/sirupsen/logrus"
	"github.com/uptrace/bun"
)

func AcceptProjectInvite(context *gin.Context, db *bun.DB) {
	projectID := context.Param("projectID")

	userID, err := auth.GetUserIDFromToken(context.GetHeader("Authorization"))
	if err != nil {
		httperror.InternalServerError(context, "Error checking for userID in token", err)
		return
	}

	var member models.ProjectMembers
	member.InvitePending = false
	_, err = db.NewUpdate().Model(&member).Column("invite_pending").Where("user_id = ?", userID).Where("project_id = ?", projectID).Exec(context)
	if err != nil {
		httperror.InternalServerError(context, "Error receiving project member data from db", err)
		return
	}

	// Audit
	err = functions_project.CreateAuditEntry(projectID, "info", "User accepted project invite", db, context)
	if err != nil {
		log.Error(err)
	}

	context.JSON(http.StatusOK, gin.H{"result": "success"})
}
