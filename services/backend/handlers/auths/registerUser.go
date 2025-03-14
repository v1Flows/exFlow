package auths

import (
	"github.com/v1Flows/exFlow/services/backend/functions/httperror"
	"github.com/v1Flows/exFlow/services/backend/pkg/models"
	"net/http"

	_ "github.com/lib/pq"
	"github.com/uptrace/bun"

	"github.com/gin-gonic/gin"
)

func RegisterUser(context *gin.Context, db *bun.DB) {
	var user models.Users
	if err := context.ShouldBindJSON(&user); err != nil {
		httperror.StatusBadRequest(context, "Error parsing incoming data", err)
		return
	}

	// check if user exists
	firstCount, err := db.NewSelect().Model(&user).Where("email = ?", user.Email).Where("username = ?", user.Username).Count(context)
	if err != nil {
		httperror.InternalServerError(context, "Error checking for email and username on db", err)
		return
	}
	if firstCount > 0 {
		httperror.StatusConflict(context, "User already exists", nil)
		return
	}

	if err := user.HashPassword(user.Password); err != nil {
		httperror.InternalServerError(context, "Error encrypting user password", err)
		return
	}

	// check if this is the first user
	count, err := db.NewSelect().Model(&user).Count(context)
	if err != nil {
		httperror.InternalServerError(context, "Error checking for already existing users on db", err)
		return
	}
	if count == 0 {
		user.Role = "admin"
	} else {
		user.Role = "user"
	}

	_, err = db.NewInsert().Model(&user).Column("email", "username", "password", "role").Exec(context)
	if err != nil {
		httperror.InternalServerError(context, "Error creating user on db", err)
		return
	}

	context.JSON(http.StatusCreated, gin.H{"result": "success"})
}
