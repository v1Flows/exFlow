package admins

import (
	"github.com/v1Flows/exFlow/services/backend/functions/httperror"
	"github.com/v1Flows/exFlow/services/backend/pkg/models"
	"net/http"

	"github.com/gin-gonic/gin"
	_ "github.com/lib/pq"
	"github.com/uptrace/bun"
)

func GetTokens(context *gin.Context, db *bun.DB) {
	tokens := make([]models.Tokens, 0)
	err := db.NewSelect().Model(&tokens).Order("created_at DESC").Scan(context)
	if err != nil {
		httperror.InternalServerError(context, "Error collecting tokens on db", err)
		return
	}

	context.JSON(http.StatusOK, gin.H{"tokens": tokens})
}
