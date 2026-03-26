package middlewares

import (
	"errors"

	"github.com/JustLABv1/justflow/apps/backend/functions/auth"
	"github.com/JustLABv1/justflow/apps/backend/functions/gatekeeper"
	"github.com/JustLABv1/justflow/apps/backend/functions/httperror"
	"github.com/JustLABv1/justflow/apps/backend/pkg/models"

	"github.com/gin-gonic/gin"
	"github.com/uptrace/bun"
)

// Editor middleware restricts access to users with the "editor" or "admin" global role,
// as well as service tokens. It follows the same validation flow as the Admin middleware.
func Editor(db *bun.DB) gin.HandlerFunc {
	return func(context *gin.Context) {
		tokenString := context.GetHeader("Authorization")
		if tokenString == "" {
			httperror.Unauthorized(context, "Request does not contain an access token", errors.New("request does not contain an access token"))
			return
		}
		err := auth.ValidateToken(tokenString)
		if err != nil {
			httperror.Unauthorized(context, "Token is not valid", err)
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
			httperror.InternalServerError(context, "Error receiving token type", err)
			return
		}

		if tokenType == "user" {
			userID, err := auth.GetUserIDFromToken(tokenString)
			if err != nil {
				httperror.InternalServerError(context, "Error receiving userID from token", err)
				return
			}
			isEditorOrAdmin, err := gatekeeper.CheckEditorOrAdmin(userID, db)
			if err != nil {
				httperror.InternalServerError(context, "Error checking for user role", err)
				return
			}
			if !isEditorOrAdmin {
				httperror.Unauthorized(context, "You must be an editor or admin", errors.New("user is not editor or admin"))
				return
			}
			context.Next()
		} else if tokenType == "service" {
			tokenID, err := auth.GetIDFromToken(tokenString)
			if err != nil {
				httperror.InternalServerError(context, "Error receiving tokenID from token", err)
				return
			}

			var token models.Tokens
			err = db.NewSelect().Model(&token).Where("id = ?", tokenID).Scan(context)
			if err != nil {
				httperror.Unauthorized(context, "Token is not valid", err)
				return
			}
			if token.Disabled {
				httperror.Unauthorized(context, "Token is currently disabled", errors.New("token is disabled"))
				return
			}
			context.Next()
		} else {
			httperror.Unauthorized(context, "Token type not allowed", errors.New("token type not allowed"))
			return
		}
	}
}
