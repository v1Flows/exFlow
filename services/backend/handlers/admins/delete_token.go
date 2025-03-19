package admins

import (
	"github.com/v1Flows/exFlow/services/backend/functions/httperror"
	"github.com/v1Flows/exFlow/services/backend/pkg/models"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/uptrace/bun"
)

func DeleteToken(context *gin.Context, db *bun.DB) {
	tokenID := context.Param("tokenID")

	_, err := db.NewDelete().Model(&models.Tokens{}).Where("id = ?", tokenID).Exec(context)
	if err != nil {
		httperror.InternalServerError(context, "Error deleting API Key on db", err)
		return
	}

	context.JSON(http.StatusOK, gin.H{"result": "success"})
}
