package tokens

import (
	"errors"
	"net/http"
	"time"

	"github.com/v1Flows/exFlow/services/backend/functions/auth"
	"github.com/v1Flows/exFlow/services/backend/functions/httperror"
	"github.com/v1Flows/exFlow/services/backend/pkg/models"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"github.com/uptrace/bun"
)

type TokenRequest struct {
	Email      string `json:"email"`
	Password   string `json:"password"`
	RememberMe bool   `json:"remember_me"`
}

func GenerateTokenUser(db *bun.DB, context *gin.Context) {
	var request TokenRequest
	if err := context.ShouldBindJSON(&request); err != nil {
		context.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		context.Abort()
		return
	}

	// get user
	var user models.Users
	err := db.NewSelect().Model(&user).Where("email = ? OR username = ?", request.Email, request.Email).Scan(context)
	if err != nil {
		httperror.InternalServerError(context, "Error collecting user information from db", err)
		return
	}

	// check if user account is disabled
	if user.Disabled {
		httperror.Unauthorized(context, "Your Account is currently disabled", errors.New("user account is disabled"))
		return
	}
	// check if password is correct
	credentialError := user.CheckPassword(request.Password)
	if credentialError != nil {
		httperror.Unauthorized(context, "Invalid credentials", errors.New("invalid credentials"))
		return
	}

	// generate token
	tokenString, ExpiresAt, err := auth.GenerateJWT(user.ID, request.RememberMe)
	if err != nil {
		httperror.InternalServerError(context, "Error generating user token", err)
		return
	}

	// write token in tokens table
	token := models.Tokens{
		UserID:      user.ID.String(),
		Key:         tokenString,
		Description: "User token",
		Type:        "user",
		ExpiresAt:   time.Unix(ExpiresAt, 0),
		CreatedAt:   time.Now(),
	}
	_, err = db.NewInsert().Model(&token).Exec(context)
	if err != nil {
		httperror.InternalServerError(context, "Error writing token to db", err)
		return
	}

	type UserResponse struct {
		ID             uuid.UUID `json:"id"`
		Email          string    `json:"email"`
		Username       string    `json:"username"`
		Disabled       bool      `json:"disabled"`
		DisabledReason string    `json:"disabled_reason"`
		Role           string    `json:"role"`
	}
	userResponse := UserResponse{
		ID:             user.ID,
		Email:          user.Email,
		Username:       user.Username,
		Disabled:       user.Disabled,
		DisabledReason: user.DisabledReason,
		Role:           user.Role,
	}

	context.JSON(http.StatusOK, gin.H{"token": tokenString, "user": userResponse, "expires_at": ExpiresAt})
}
