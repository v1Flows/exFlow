package admins

import (
	"github.com/v1Flows/exFlow/services/backend/functions/httperror"
	functions "github.com/v1Flows/exFlow/services/backend/functions/user"
	"github.com/v1Flows/exFlow/services/backend/pkg/models"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/uptrace/bun"
)

func SendAdminToUserNotification(context *gin.Context, db *bun.DB) {
	userID := context.Param("userID")

	var notification models.Notifications
	if err := context.ShouldBindJSON(&notification); err != nil {
		httperror.StatusBadRequest(context, "Error parsing incoming data", err)
		return
	}

	err := functions.SendUserNotification(userID, notification.Title, notification.Body, "solar:shield-up-broken", "danger", "", "", db)
	if err != nil {
		httperror.InternalServerError(context, "Error sending notification to user", err)
		return
	}

	context.JSON(http.StatusOK, gin.H{"result": "success"})
}
