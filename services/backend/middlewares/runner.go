package middlewares

import (
	"errors"

	"github.com/v1Flows/exFlow/services/backend/config"
	"github.com/v1Flows/exFlow/services/backend/functions/auth"
	"github.com/v1Flows/exFlow/services/backend/functions/httperror"

	"github.com/gin-gonic/gin"
	"github.com/uptrace/bun"
)

func Runner(db *bun.DB) gin.HandlerFunc {
	return func(context *gin.Context) {
		tokenString := context.GetHeader("Authorization")
		if tokenString == "" {
			httperror.Unauthorized(context, "Request does not contain an access token", errors.New("request does not contain an access token"))
			return
		}

		err := auth.ValidateToken(tokenString)
		if err != nil {
			// if the token is not valid
			// check if the token matches the config.runner.shared_runner_secret
			if config.Config.Runner.SharedRunnerSecret != "" {
				if tokenString != config.Config.Runner.SharedRunnerSecret {
					httperror.Unauthorized(context, "The provided secret is not valid", err)
					return
				} else {
					context.Next()
				}
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
