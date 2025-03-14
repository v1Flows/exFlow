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

func GetUserNotifications(context *gin.Context, db *bun.DB) {
	userID, err := auth.GetUserIDFromToken(context.GetHeader("Authorization"))
	if err != nil {
		httperror.Unauthorized(context, "Error receiving userID from token", err)
		return
	}

	notifications := make([]models.Notifications, 0)
	err = db.NewSelect().Model(&notifications).Where("user_id = ?", userID).Order("created_at DESC").Scan(context)
	if err != nil {
		httperror.InternalServerError(context, "Error collecting notifications from db", err)
		return
	}

	context.JSON(http.StatusOK, gin.H{"result": "success", "notifications": notifications})
}
