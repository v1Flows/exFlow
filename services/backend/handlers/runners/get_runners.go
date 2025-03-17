package runners

import (
	"net/http"

	"github.com/v1Flows/exFlow/services/backend/functions/auth"
	"github.com/v1Flows/exFlow/services/backend/functions/httperror"
	"github.com/v1Flows/exFlow/services/backend/pkg/models"

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

	exflowRunners := make([]models.Runners, 0)
	err = db.NewSelect().Model(&exflowRunners).Where("shared_runner = true").Scan(context)
	if err != nil {
		httperror.InternalServerError(context, "Error collecting exflow runners from db", err)
		return
	}

	runners := append(projectRunners, exflowRunners...)

	context.JSON(http.StatusOK, gin.H{"runners": runners})
}
