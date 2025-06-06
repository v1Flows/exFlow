package admins

import (
	"net/http"

	"github.com/v1Flows/exFlow/services/backend/functions/httperror"
	"github.com/v1Flows/exFlow/services/backend/pkg/models"

	"github.com/gin-gonic/gin"
	"github.com/uptrace/bun"
)

func GetRunners(context *gin.Context, db *bun.DB) {
	runners := make([]models.Runners, 0)
	err := db.NewSelect().Model(&runners).Scan(context)
	if err != nil {
		httperror.InternalServerError(context, "Error collecting runners data on db", err)
		return
	}

	context.JSON(http.StatusOK, gin.H{"runners": runners})
}
