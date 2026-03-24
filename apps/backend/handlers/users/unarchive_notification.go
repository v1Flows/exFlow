package users

import (
	"github.com/JustLABv1/justflow/apps/backend/functions/auth"
	"github.com/JustLABv1/justflow/apps/backend/functions/httperror"
	"github.com/JustLABv1/justflow/apps/backend/pkg/models"
	"net/http"

	_ "github.com/lib/pq"
	"github.com/uptrace/bun"

	"github.com/gin-gonic/gin"
)

func UnarchiveUserNotification(context *gin.Context, db *bun.DB) {
	notificationID := context.Param("notificationID")

	userID, err := auth.GetUserIDFromToken(context.GetHeader("Authorization"))
	if err != nil {
		httperror.Unauthorized(context, "Error receiving userID from token", err)
		return
	}

	_, err = db.NewUpdate().Model(&models.Notifications{}).Set("is_archived = false").Where("id = ?", notificationID).Where("user_id = ?", userID).Exec(context)
	if err != nil {
		httperror.InternalServerError(context, "Error updating notification state on db", err)
		return
	}

	context.JSON(http.StatusOK, gin.H{"result": "success"})
}
