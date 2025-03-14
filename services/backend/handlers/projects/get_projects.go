package projects

import (
	"github.com/v1Flows/exFlow/services/backend/functions/auth"
	"github.com/v1Flows/exFlow/services/backend/functions/httperror"
	"github.com/v1Flows/exFlow/services/backend/pkg/models"
	"net/http"

	"github.com/gin-gonic/gin"
	_ "github.com/lib/pq"
	"github.com/uptrace/bun"
)

func GetProjects(context *gin.Context, db *bun.DB) {
	userID, err := auth.GetUserIDFromToken(context.GetHeader("Authorization"))
	if err != nil {
		httperror.InternalServerError(context, "Error receiving userID from token", err)
		return
	}

	projects := make([]models.Projects, 0)
	err = db.NewSelect().Model(&projects).Where("id::uuid IN (SELECT project_id::uuid FROM project_members WHERE user_id = ? AND invite_pending = false)", userID).Scan(context)
	if err != nil {
		httperror.InternalServerError(context, "Error receiving projects from db", err)
		return
	}

	pendingProjects := make([]models.Projects, 0)
	err = db.NewSelect().Model(&pendingProjects).Where("id::uuid IN (SELECT project_id::uuid FROM project_members WHERE user_id = ? AND invite_pending = true)", userID).Scan(context)
	if err != nil {
		httperror.InternalServerError(context, "Error receiving pending projects from db", err)
		return
	}

	context.JSON(http.StatusOK, gin.H{"projects": projects, "pending_projects": pendingProjects})
}
