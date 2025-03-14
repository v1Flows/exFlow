package httperror

import (
	"net/http"

	"github.com/gin-gonic/gin"
)

func StatusNotFound(context *gin.Context, message string, err error) {
	context.JSON(http.StatusNotFound, gin.H{"message": message, "error": err.Error()})
	context.Abort()
}
