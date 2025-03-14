package httperror

import (
	"net/http"

	"github.com/gin-gonic/gin"
)

func InternalServerError(context *gin.Context, message string, err error) {
	context.JSON(http.StatusInternalServerError, gin.H{"message": message, "error": err.Error()})
	context.Abort()
}
