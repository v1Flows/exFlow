package admins

import (
	"github.com/v1Flows/exFlow/services/backend/functions/httperror"
	"github.com/v1Flows/exFlow/services/backend/pkg/models"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/uptrace/bun"
)

func DisableUser(context *gin.Context, db *bun.DB) {
	userID := context.Param("userID")

	var user models.Users
	if err := context.ShouldBindJSON(&user); err != nil {
		httperror.StatusBadRequest(context, "Error parsing incoming data", err)
		return
	}

	user.UpdatedAt = time.Now()

	res, err := db.NewUpdate().Model(&user).Column("disabled", "disabled_reason", "updated_at").Where("id = ?", userID).Exec(context)
	if err != nil {
		httperror.InternalServerError(context, "Error updating user on db", err)
		return
	}

	context.JSON(http.StatusOK, gin.H{"result": "success", "response": res})
}
