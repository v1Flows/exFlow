package auths

import (
	"github.com/v1Flows/exFlow/services/backend/functions/httperror"
	"github.com/v1Flows/exFlow/services/backend/pkg/models"
	"errors"
	"net/http"

	_ "github.com/lib/pq"
	"github.com/uptrace/bun"

	"github.com/gin-gonic/gin"
)

func CheckUserTaken(context *gin.Context, db *bun.DB) {
	var user models.Users
	if err := context.ShouldBindJSON(&user); err != nil {
		httperror.StatusBadRequest(context, "Error parsing incoming data", err)
		return
	}

	// check if username exists
	usernameCount, err := db.NewSelect().Model(&user).Where("username = ?", user.Username).Count(context)
	if err != nil {
		httperror.InternalServerError(context, "Error checking for username on db", err)
		return
	}
	if usernameCount > 0 {
		httperror.StatusConflict(context, "Username is already taken", errors.New("username already taken"))
		return
	}

	// check if email exists
	emailCount, err := db.NewSelect().Model(&user).Where("email = ?", user.Email).Count(context)
	if err != nil {
		httperror.InternalServerError(context, "Error checking for email on db", err)
		return
	}
	if emailCount > 0 {
		httperror.StatusConflict(context, "Email is already taken", errors.New("email already taken"))
		return
	}

	context.JSON(http.StatusCreated, gin.H{"result": "success"})
}
