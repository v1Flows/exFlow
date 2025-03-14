package httperror

import (
	"net/http"

	"github.com/gin-gonic/gin"
)

func Unauthorized(context *gin.Context, message string, err error) {
	context.JSON(http.StatusUnauthorized, gin.H{"message": message, "error": err.Error()})
	context.Abort()
}
