package middlewares

import (
	"errors"

	"github.com/JustLABv1/justflow/apps/backend/config"
	"github.com/JustLABv1/justflow/apps/backend/functions/auth"
	"github.com/JustLABv1/justflow/apps/backend/functions/httperror"

	"github.com/gin-gonic/gin"
	"github.com/uptrace/bun"
)

// Runner validates JWT tokens for authenticated runner endpoints.
// The shared runner secret is NOT accepted here — use RunnerRegister for /register.
func Runner(db *bun.DB) gin.HandlerFunc {
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
			return
		}

		context.Next()
	}
}

// RunnerRegister validates runner tokens for the /register endpoint.
// Accepts both JWT tokens and the configured shared runner secret.
func RunnerRegister(db *bun.DB) gin.HandlerFunc {
	return func(context *gin.Context) {
		tokenString := context.GetHeader("Authorization")
		if tokenString == "" {
			httperror.Unauthorized(context, "Request does not contain an access token", errors.New("request does not contain an access token"))
			return
		}

		err := auth.ValidateToken(tokenString)
		if err != nil {
			// Fall back to shared runner secret only for registration
			if config.Config.Runner.SharedRunnerSecret != "" && tokenString == config.Config.Runner.SharedRunnerSecret {
				context.Next()
				return
			}
			httperror.Unauthorized(context, "The provided token is not valid", err)
			return
		}

		valid, err := auth.ValidateTokenDBEntry(tokenString, db, context)
		if err != nil {
			httperror.InternalServerError(context, "Error receiving token from db", err)
			return
		}

		if !valid {
			return
		}

		context.Next()
	}
}
