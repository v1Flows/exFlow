package users

import (
	"github.com/v1Flows/exFlow/services/backend/functions/auth"
	"github.com/v1Flows/exFlow/services/backend/functions/httperror"
	"github.com/v1Flows/exFlow/services/backend/pkg/models"
	"net/http"

	_ "github.com/lib/pq"
	"github.com/uptrace/bun"

	"github.com/gin-gonic/gin"
)

func ArchiveUserNotification(context *gin.Context, db *bun.DB) {
	notificationID := context.Param("notificationID")

	userID, err := auth.GetUserIDFromToken(context.GetHeader("Authorization"))
	if err != nil {
		httperror.Unauthorized(context, "Error receiving userID from token", err)
		return
	}

	_, err = db.NewUpdate().Model(&models.Notifications{}).Set("is_archived = true").Where("id = ?", notificationID).Where("user_id = ?", userID).Exec(context)
	if err != nil {
		httperror.InternalServerError(context, "Error archiving notification on db", err)
		return
	}

	context.JSON(http.StatusOK, gin.H{"result": "success"})
}
