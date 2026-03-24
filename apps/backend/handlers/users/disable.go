package users

import (
	"github.com/JustLABv1/justflow/services/backend/functions/auth"
	"github.com/JustLABv1/justflow/services/backend/functions/httperror"
	"github.com/JustLABv1/justflow/services/backend/pkg/models"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/uptrace/bun"
)

func DisableUser(context *gin.Context, db *bun.DB) {
	userID, err := auth.GetUserIDFromToken(context.GetHeader("Authorization"))
	if err != nil {
		httperror.Unauthorized(context, "Error receiving userID from token", err)
		return
	}

	var user models.Users

	user.Disabled = true
	user.UpdatedAt = time.Now()

	_, err = db.NewUpdate().Model(&user).Column("disabled", "updated_at").Where("id = ?", userID).Exec(context)
	if err != nil {
		httperror.InternalServerError(context, "Error disable user on db", err)
		return
	}

	context.JSON(http.StatusOK, gin.H{"result": "success"})
}
