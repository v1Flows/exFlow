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

func ChangeUserDetails(context *gin.Context, db *bun.DB) {
	userID, err := auth.GetUserIDFromToken(context.GetHeader("Authorization"))
	if err != nil {
		httperror.Unauthorized(context, "Error receiving userID from token", err)
		return
	}

	var user models.Users
	if err := context.ShouldBindJSON(&user); err != nil {
		httperror.StatusBadRequest(context, "Error parsing incoming data", err)
		return
	}

	_, err = db.NewUpdate().Model(&user).Column("username", "email").Where("id = ?", userID).Exec(context)
	if err != nil {
		httperror.InternalServerError(context, "Error updating user on db", err)
		return
	}

	context.JSON(http.StatusCreated, gin.H{"result": "success"})
}
