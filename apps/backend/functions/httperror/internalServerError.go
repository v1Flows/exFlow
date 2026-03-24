package httperror

import (
	"net/http"

	"github.com/gin-gonic/gin"
)

func InternalServerError(context *gin.Context, message string, err error) {
	errorMessage := "Unknown error"
	if err != nil {
		errorMessage = err.Error()
	}
	context.JSON(http.StatusInternalServerError, gin.H{"message": message, "error": errorMessage})
}
