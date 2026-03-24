package httperror

import (
	"net/http"

	"github.com/gin-gonic/gin"
)

func StatusBadRequest(context *gin.Context, message string, err error) {
	context.JSON(http.StatusBadRequest, gin.H{"message": message, "error": err.Error()})
	context.Abort()
}
