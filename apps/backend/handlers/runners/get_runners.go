package runners

import (
	"net/http"

	"github.com/JustLABv1/justflow/apps/backend/functions/auth"
	"github.com/JustLABv1/justflow/apps/backend/functions/httperror"
	"github.com/JustLABv1/justflow/apps/backend/pkg/models"

	"github.com/gin-gonic/gin"
	"github.com/uptrace/bun"
)

func GetRunners(context *gin.Context, db *bun.DB) {
	userID, err := auth.GetUserIDFromToken(context.GetHeader("Authorization"))
	if err != nil {
		httperror.InternalServerError(context, "Error receiving userID from token", err)
		return
	}

	projectRunners := make([]models.Runners, 0)
	err = db.NewSelect().Model(&projectRunners).Where("project_id::text IN (SELECT project_id::text FROM project_members WHERE user_id = ?)", userID).Where("shared_runner = false").Scan(context)
	if err != nil {
		httperror.InternalServerError(context, "Error collecting project runners from db", err)
		return
	}

	justflowRunners := make([]models.Runners, 0)
	err = db.NewSelect().Model(&justflowRunners).Where("shared_runner = true").Scan(context)
	if err != nil {
		httperror.InternalServerError(context, "Error collecting justflow runners from db", err)
		return
	}

	runners := append(projectRunners, justflowRunners...)

	context.JSON(http.StatusOK, gin.H{"runners": runners})
}
