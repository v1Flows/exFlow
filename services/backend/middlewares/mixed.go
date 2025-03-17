package middlewares

import (
	"errors"

	"github.com/v1Flows/exFlow/services/backend/functions/auth"
	"github.com/v1Flows/exFlow/services/backend/functions/gatekeeper"
	"github.com/v1Flows/exFlow/services/backend/functions/httperror"
	"github.com/v1Flows/exFlow/services/backend/pkg/models"

	"github.com/gin-gonic/gin"
	"github.com/uptrace/bun"
)

func Mixed(db *bun.DB) gin.HandlerFunc {
	return func(context *gin.Context) {
		tokenString := context.GetHeader("Authorization")
		if tokenString == "" {
			httperror.Unauthorized(context, "Request does not contain an access token", errors.New("request does not contain an access token"))
			return
		}
		err := auth.ValidateToken(tokenString)
		if err != nil {
			httperror.Unauthorized(context, "The provided token is not valid", err)
			return
		}

		valid, err := auth.ValidateTokenDBEntry(tokenString, db, context)
		if err != nil {
			httperror.InternalServerError(context, "Error receiving token from db", err)
			return
		}

		if !valid {
			httperror.Unauthorized(context, "The provided token is not valid", errors.New("the provided token is not valid"))
			return
		}

		tokenType, err := auth.GetTypeFromToken(tokenString)
		if err != nil {
			httperror.InternalServerError(context, "Error checking for token type", err)
			return
		}

		if tokenType == "runner" || tokenType == "project_auto_runner" || tokenType == "shared_auto_runner" {
			context.Next()
		} else if tokenType == "user" {
			userId, err := auth.GetUserIDFromToken(tokenString)
			if err != nil {
				httperror.InternalServerError(context, "Error receiving userID from token", err)
				return
			}
			userDisabled, err := gatekeeper.CheckAccountStatus(userId.String(), db)
			if err != nil {
				httperror.InternalServerError(context, "Error checking for users account status", err)
				return
			}
			if userDisabled {
				httperror.Unauthorized(context, "Your Account is currently disabled", errors.New("user is disabled"))
				return
			}
			context.Next()
		} else if tokenType == "project" || tokenType == "service" {
			tokenID, err := auth.GetIDFromToken(tokenString)
			if err != nil {
				httperror.InternalServerError(context, "Error receiving tokenID from token", err)
				return
			}

			// check for token in tokens table
			var token models.Tokens
			err = db.NewSelect().Model(&token).Where("id = ?", tokenID).Scan(context)
			if err != nil {
				httperror.Unauthorized(context, "Token is not valid", err)
				return
			}
			// check if token is disabled
			if token.Disabled {
				httperror.Unauthorized(context, "Token is currently disabled", errors.New("token is disabled"))
				return
			}

			context.Next()
		} else {
			httperror.Unauthorized(context, "Token type is invalid", errors.New("invalid token type"))
		}
	}
}
