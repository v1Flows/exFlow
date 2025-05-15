package admins

import (
	"net/http"
	"strings"
	"time"

	"github.com/v1Flows/exFlow/services/backend/functions/httperror"
	"github.com/v1Flows/exFlow/services/backend/pkg/models"

	"github.com/gin-gonic/gin"
	_ "github.com/lib/pq"
	"github.com/uptrace/bun"
)

func UpdateUser(context *gin.Context, db *bun.DB) {
	userID := context.Param("userID")

	var user models.Users
	if err := context.ShouldBindJSON(&user); err != nil {
		httperror.StatusBadRequest(context, "Error parsing incoming data", err)
		return
	}

	// get user db data
	var userDB models.Users
	err := db.NewSelect().Model(&userDB).Where("id = ?", userID).Scan(context)
	if err != nil {
		httperror.InternalServerError(context, "Error getting user from db", err)
		return
	}

	if user.Password != "" {
		// hash password
		if err := user.HashPassword(user.Password); err != nil {
			httperror.InternalServerError(context, "Error encrypting user password", err)
			return
		}
	} else {
		user.Password = userDB.Password
	}

	user.UpdatedAt = time.Now()
	user.Role = strings.ToLower(user.Role)
	_, err = db.NewUpdate().Model(&user).Column("username", "email", "role", "updated_at", "password").Where("id = ?", userID).Exec(context)
	if err != nil {
		httperror.InternalServerError(context, "Error updating user on db", err)
		return
	}

	context.JSON(http.StatusCreated, gin.H{"result": "success"})
}
