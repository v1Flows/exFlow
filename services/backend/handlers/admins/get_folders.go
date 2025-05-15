package admins

import (
	"net/http"

	"github.com/v1Flows/exFlow/services/backend/functions/httperror"
	"github.com/v1Flows/exFlow/services/backend/pkg/models"

	"github.com/gin-gonic/gin"
	_ "github.com/lib/pq"
	"github.com/uptrace/bun"
)

func GetFolders(context *gin.Context, db *bun.DB) {
	folders := make([]models.Folders, 0)
	err := db.NewSelect().Model(&folders).Scan(context)
	if err != nil {
		httperror.InternalServerError(context, "Error collecting folders data on db", err)
		return
	}

	context.JSON(http.StatusOK, gin.H{"folders": folders})
}
