package users

import (
	"github.com/v1Flows/exFlow/services/backend/functions/auth"
	"github.com/v1Flows/exFlow/services/backend/functions/httperror"
	"github.com/v1Flows/exFlow/services/backend/pkg/models"
	"errors"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/uptrace/bun"
)

func ChangeUserPassword(context *gin.Context, db *bun.DB) {
	userID, err := auth.GetUserIDFromToken(context.GetHeader("Authorization"))
	if err != nil {
		httperror.Unauthorized(context, "Error receiving userID from token", err)
		return
	}

	type ChangePasswordRequest struct {
		CurrentPassword string `json:"current_password"`
		NewPassword     string `json:"new_password"`
		ConfirmPassword string `json:"confirm_password"`
	}

	var changePasswordRequest ChangePasswordRequest
	if err := context.ShouldBindJSON(&changePasswordRequest); err != nil {
		httperror.StatusBadRequest(context, "Error parsing incoming data", err)
		return
	}

	// check if passwords match
	if changePasswordRequest.NewPassword != changePasswordRequest.ConfirmPassword {
		httperror.StatusBadRequest(context, "Passwords do not match", errors.New("passwords do not match"))
		return
	}

	// check if user exists
	var user models.Users
	err = db.NewSelect().Model(&user).Where("id = ?", userID).Scan(context)
	if err != nil {
		httperror.InternalServerError(context, "Error collecting user data from db", err)
		return
	}

	// check if user is disabled
	if user.Disabled {
		httperror.StatusBadRequest(context, "Your Account is disabled", errors.New("user is disabled"))
		return
	}

	// check if current password is correct
	credentialError := user.CheckPassword(changePasswordRequest.CurrentPassword)
	if credentialError != nil {
		httperror.Unauthorized(context, "Current password is incorrect", errors.New("current password is incorrect"))
		return
	}

	// hash the new password
	if err := user.HashPassword(changePasswordRequest.NewPassword); err != nil {
		httperror.InternalServerError(context, "Error encrypting new password", err)
		return
	}

	// update password
	_, err = db.NewUpdate().Model(&user).Where("id = ?", userID).Column("password").Exec(context)
	if err != nil {
		httperror.InternalServerError(context, "Error updating password on db", err)
		return
	}

	context.JSON(http.StatusOK, gin.H{"result": "success", "message": "Password changed successfully"})
}
