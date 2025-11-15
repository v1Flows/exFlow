package auths

import (
	"crypto/rand"
	"encoding/base64"
	"fmt"
	"net/http"

	"github.com/JustLABv1/justflow/services/backend/functions/auth"
	"github.com/JustLABv1/justflow/services/backend/functions/httperror"
	"github.com/JustLABv1/justflow/services/backend/pkg/models"
	"github.com/gin-gonic/gin"
	"github.com/uptrace/bun"
)

// OIDCStartLogin initiates OIDC login flow
func OIDCStartLogin(db *bun.DB) gin.HandlerFunc {
	return func(context *gin.Context) {
		provider := context.Param("provider")

		// Validate provider is configured
		if provider == "" {
			httperror.StatusBadRequest(context, "Provider not specified", fmt.Errorf("missing provider"))
			return
		}

		// Create OIDC manager
		manager, err := auth.NewOIDCManager(context, provider)
		if err != nil {
			httperror.StatusBadRequest(context, "Invalid OIDC provider", err)
			return
		}

		// Generate state token for CSRF protection
		state := generateRandomState()

		// Store state in session/store (implement based on your session management)
		// For now, we'll return it to the client to include in callback

		// Get authorization URL
		authURL := manager.GetAuthorizationURL(state)

		context.JSON(http.StatusOK, gin.H{
			"auth_url": authURL,
			"state":    state,
		})
	}
}

// OIDCCallback handles OIDC provider callback
func OIDCCallback(db *bun.DB) gin.HandlerFunc {
	return func(context *gin.Context) {
		provider := context.Param("provider")
		code := context.Query("code")
		state := context.Query("state")

		if code == "" {
			httperror.StatusBadRequest(context, "Authorization code missing", fmt.Errorf("missing code parameter"))
			return
		}

		if state == "" {
			httperror.StatusBadRequest(context, "State parameter missing", fmt.Errorf("missing state parameter"))
			return
		}

		// TODO: Verify state token against stored value for CSRF protection
		// For now, we'll accept it as-is

		// Create OIDC manager
		manager, err := auth.NewOIDCManager(context, provider)
		if err != nil {
			httperror.StatusBadRequest(context, "Invalid OIDC provider", err)
			return
		}

		// Exchange authorization code for token
		token, err := manager.ExchangeCodeForToken(context, code)
		if err != nil {
			httperror.Unauthorized(context, "Failed to exchange authorization code", err)
			return
		}

		// Get ID token from response
		rawIDToken, ok := token.Extra("id_token").(string)
		if !ok {
			httperror.StatusBadRequest(context, "ID token not found in response", fmt.Errorf("missing id_token"))
			return
		}

		// Verify ID token
		idToken, err := manager.VerifyIDToken(context, rawIDToken)
		if err != nil {
			httperror.Unauthorized(context, "Failed to verify ID token", err)
			return
		}

		// Get user information
		userInfo, err := manager.GetUserInfo(idToken)
		if err != nil {
			httperror.StatusBadRequest(context, "Failed to extract user information", err)
			return
		}

		// Find or create user
		user, err := findOrCreateOIDCUser(db, context, provider, userInfo)
		if err != nil {
			httperror.InternalServerError(context, "Failed to process user", err)
			return
		}

		if user == nil {
			httperror.StatusBadRequest(context, "User could not be found or created", fmt.Errorf("user is nil"))
			return
		}

		// Check if user account is disabled
		if user.Disabled {
			httperror.Unauthorized(context, "Your Account is currently disabled", fmt.Errorf("user account is disabled"))
			return
		}

		// Generate JWT token
		tokenString, expiresAt, err := auth.GenerateOIDCToken(user.ID, false)
		if err != nil {
			httperror.InternalServerError(context, "Error generating user token", err)
			return
		}

		// Write token to database
		dbToken := models.Tokens{
			UserID:      user.ID.String(),
			Key:         tokenString,
			Description: fmt.Sprintf("%s OIDC token", provider),
			Type:        "user",
			ExpiresAt:   idToken.Expiry,
			CreatedAt:   idToken.IssuedAt,
		}
		_, err = db.NewInsert().Model(&dbToken).Exec(context)
		if err != nil {
			httperror.InternalServerError(context, "Error writing token to db", err)
			return
		}

		type UserResponse struct {
			ID             string `json:"id"`
			Email          string `json:"email"`
			Username       string `json:"username"`
			Disabled       bool   `json:"disabled"`
			DisabledReason string `json:"disabled_reason"`
			Role           string `json:"role"`
		}

		userResponse := UserResponse{
			ID:             user.ID.String(),
			Email:          user.Email,
			Username:       user.Username,
			Disabled:       user.Disabled,
			DisabledReason: user.DisabledReason,
			Role:           user.Role,
		}

		context.JSON(http.StatusOK, gin.H{
			"token":      tokenString,
			"user":       userResponse,
			"expires_at": expiresAt,
		})
	}
}

// OIDCListProviders returns list of configured OIDC providers
func OIDCListProviders() gin.HandlerFunc {
	return func(context *gin.Context) {
		providers := make([]string, 0)
		for name := range context.GetString("oidc_providers") {
			_ = name
			// This is a placeholder - you'll need to adjust based on your config structure
		}

		context.JSON(http.StatusOK, gin.H{
			"providers": providers,
		})
	}
}

// Helper functions

// generateRandomState generates a random state string for CSRF protection
func generateRandomState() string {
	b := make([]byte, 32)
	if _, err := rand.Read(b); err != nil {
		// Fallback if random fails
		return "state_" + fmt.Sprintf("%d", len(b))
	}
	return base64.URLEncoding.EncodeToString(b)
}

// findOrCreateOIDCUser finds or creates a user based on OIDC information
func findOrCreateOIDCUser(db *bun.DB, ctx *gin.Context, provider string, userInfo *auth.OIDCUserInfo) (*models.Users, error) {
	// First, try to find user by OIDC provider and provider user ID
	var user models.Users
	err := db.NewSelect().Model(&user).
		Where("oidc_provider = ? AND oidc_provider_user_id = ?", provider, userInfo.Sub).
		Scan(ctx)

	if err == nil {
		// User found by OIDC info
		return &user, nil
	}

	// Try to find user by email (in case they previously registered)
	err = db.NewSelect().Model(&user).Where("email = ?", userInfo.Email).Scan(ctx)

	if err == nil {
		// User found by email - update their OIDC provider info
		user.OIDCProvider = provider
		user.OIDCProviderUserID = userInfo.Sub
		if userInfo.EmailVerified && !user.EmailVerified {
			user.EmailVerified = true
		}
		_, updateErr := db.NewUpdate().Model(&user).Where("id = ?", user.ID).Exec(ctx)
		if updateErr != nil {
			return nil, fmt.Errorf("failed to update user with OIDC info: %w", updateErr)
		}
		return &user, nil
	}

	// Create new user from OIDC information
	newUser := models.Users{
		Email:              userInfo.Email,
		Username:           userInfo.PreferredUsername,
		EmailVerified:      userInfo.EmailVerified,
		Role:               "user", // Default role for new OIDC users
		Disabled:           false,
		OIDCProvider:       provider,
		OIDCProviderUserID: userInfo.Sub,
		Password:           "", // OIDC users don't have password initially
	}

	// Use provided name if available
	if userInfo.Name != "" {
		newUser.Username = userInfo.Name
	} else if userInfo.PreferredUsername != "" {
		newUser.Username = userInfo.PreferredUsername
	}

	_, err = db.NewInsert().Model(&newUser).Exec(ctx)
	if err != nil {
		return nil, fmt.Errorf("failed to create new user: %w", err)
	}

	return &newUser, nil
}
