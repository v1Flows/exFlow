package auths

import (
	"errors"
	"net/http"

	"github.com/google/uuid"
	"github.com/v1Flows/exFlow/services/backend/functions/httperror"
	"github.com/v1Flows/exFlow/services/backend/pkg/models"

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

	var checkEmail bool
	var checkUsername bool

	checkEmail = true
	checkUsername = true

	if user.ID != uuid.Nil {
		// get user data from db
		var userFromDb models.Users
		err := db.NewSelect().Model(&userFromDb).Where("id = ?", user.ID).Scan(context)
		if err != nil {
			httperror.InternalServerError(context, "Error getting user data from db", err)
			return
		}

		if userFromDb.Email == user.Email {
			checkEmail = false
		}

		if userFromDb.Username == user.Username {
			checkUsername = false
		}
	}

	// check if username exists
	if checkUsername {
		usernameCount, err := db.NewSelect().Model(&user).Where("username = ?", user.Username).Count(context)
		if err != nil {
			httperror.InternalServerError(context, "Error checking for username on db", err)
			return
		}
		if usernameCount > 0 {
			httperror.StatusConflict(context, "Username is already taken", errors.New("username already taken"))
			return
		}
	}

	// check if email exists
	if checkEmail {
		emailCount, err := db.NewSelect().Model(&user).Where("email = ?", user.Email).Count(context)
		if err != nil {
			httperror.InternalServerError(context, "Error checking for email on db", err)
			return
		}
		if emailCount > 0 {
			httperror.StatusConflict(context, "Email is already taken", errors.New("email already taken"))
			return
		}
	}

	context.JSON(http.StatusCreated, gin.H{"result": "success"})
}
