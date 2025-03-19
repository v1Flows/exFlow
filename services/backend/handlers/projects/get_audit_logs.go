package projects

import (
	"github.com/v1Flows/exFlow/services/backend/functions/gatekeeper"
	"github.com/v1Flows/exFlow/services/backend/functions/httperror"
	"github.com/v1Flows/exFlow/services/backend/pkg/models"
	"errors"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/uptrace/bun"
)

func GetProjectAuditLogs(context *gin.Context, db *bun.DB) {
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

	audit := make([]models.AuditWithUser, 0)
	err = db.NewRaw("SELECT audit.*, users.username, users.email, users.role FROM audit JOIN users ON audit.user_id::text = users.id::text WHERE audit.project_id = ? ORDER BY created_at DESC", projectID).Scan(context, &audit)
	if err != nil {
		httperror.InternalServerError(context, "Error receiving project audit logs from db", err)
		return
	}

	context.JSON(http.StatusOK, gin.H{"audit": audit})
}
