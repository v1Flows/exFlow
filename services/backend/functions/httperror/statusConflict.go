package httperror

import (
	"net/http"

	"github.com/gin-gonic/gin"
)

func StatusConflict(context *gin.Context, message string, err error) {
	context.JSON(http.StatusConflict, gin.H{"message": message, "error": err.Error()})
	context.Abort()
}
