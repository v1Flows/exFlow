package admins

import (
	"github.com/v1Flows/exFlow/services/backend/functions/httperror"
	"github.com/v1Flows/exFlow/services/backend/pkg/models"
	"net/http"

	"github.com/gin-gonic/gin"
	_ "github.com/lib/pq"
	"github.com/uptrace/bun"
)

func GetFlows(context *gin.Context, db *bun.DB) {
	flows := make([]models.Flows, 0)
	err := db.NewSelect().Model(&flows).Scan(context)
	if err != nil {
		httperror.InternalServerError(context, "Error collecting flow data on db", err)
		return
	}

	context.JSON(http.StatusOK, gin.H{"flows": flows})
}
