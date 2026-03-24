package projects

import (
	"github.com/JustLABv1/justflow/apps/backend/functions/auth"
	"github.com/JustLABv1/justflow/apps/backend/functions/httperror"
	functions_project "github.com/JustLABv1/justflow/apps/backend/functions/project"
	"github.com/JustLABv1/justflow/apps/backend/pkg/models"
	"net/http"

	"github.com/gin-gonic/gin"
	log "github.com/sirupsen/logrus"
	"github.com/uptrace/bun"
)

func DeclineProjectInvite(context *gin.Context, db *bun.DB) {
	projectID := context.Param("projectID")

	userID, err := auth.GetUserIDFromToken(context.GetHeader("Authorization"))
	if err != nil {
		httperror.InternalServerError(context, "Error receiving userID from token", err)
		return
	}

	_, err = db.NewDelete().Model(&models.ProjectMembers{}).Where("user_id = ?", userID).Where("project_id = ?", projectID).Exec(context)
	if err != nil {
		httperror.InternalServerError(context, "Error removing temporary membership from project", err)
		return
	}

	// Audit
	err = functions_project.CreateAuditEntry(projectID, "info", "User declined invite to project", db, context)
	if err != nil {
		log.Error(err)
	}

	context.JSON(http.StatusOK, gin.H{"result": "success"})
}
