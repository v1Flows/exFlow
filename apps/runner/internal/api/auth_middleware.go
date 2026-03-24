package api

import (
	"errors"

	"github.com/JustLABv1/justflow/services/backend/functions/httperror"
	"github.com/JustLABv1/runner/internal/token"

	"github.com/gin-gonic/gin"
)

func Auth() gin.HandlerFunc {
	return func(context *gin.Context) {
		tokenString := context.GetHeader("Authorization")
		if tokenString == "" {
			httperror.Unauthorized(context, "Request does not contain an access token", errors.New("request does not contain an access token"))
			return
		}
		valid := token.ValidateToken(tokenString)

		if !valid {
			httperror.Unauthorized(context, "Token is not valid", errors.New("token is not valid"))
			return
		}

		// Token is valid, proceed with the request
		context.Next()
	}
}
