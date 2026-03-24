package admins

import (
	"github.com/JustLABv1/justflow/services/backend/functions/httperror"
	"github.com/JustLABv1/justflow/services/backend/pkg/models"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/uptrace/bun"
)

func UpdateSettings(context *gin.Context, db *bun.DB) {
	var settings models.Settings
	if err := context.ShouldBindJSON(&settings); err != nil {
		httperror.StatusBadRequest(context, "Error parsing incoming data", err)
		return
	}

	result, err := db.NewUpdate().Model(&settings).Where("id = 1").Exec(context)
	if err != nil {
		httperror.InternalServerError(context, "Error updating settings on db", err)
		return
	}

	context.JSON(http.StatusOK, gin.H{"settings": result, "result": "success"})
}
