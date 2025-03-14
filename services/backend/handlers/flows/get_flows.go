package flows

import (
	"github.com/v1Flows/exFlow/services/backend/functions/auth"
	"github.com/v1Flows/exFlow/services/backend/functions/httperror"
	"github.com/v1Flows/exFlow/services/backend/pkg/models"
	"net/http"

	"github.com/gin-gonic/gin"
	_ "github.com/lib/pq"
	"github.com/uptrace/bun"
)

func GetFlows(context *gin.Context, db *bun.DB) {
	userID, err := auth.GetUserIDFromToken(context.GetHeader("Authorization"))
	if err != nil {
		httperror.InternalServerError(context, "Error receiving userID from token", err)
		return
	}

	flows := make([]models.Flows, 0)
	count, err := db.NewSelect().Model(&flows).Where("project_id::uuid IN (SELECT project_id::uuid FROM project_members WHERE user_id = ? AND invite_pending = false)", userID).ScanAndCount(context)
	if err != nil {
		httperror.InternalServerError(context, "Error collecting flows from db", err)
		return
	}

	context.JSON(http.StatusOK, gin.H{"flows": flows, "count": count})
}
