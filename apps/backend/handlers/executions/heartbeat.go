package executions

import (
	"net/http"
	"time"

	"github.com/JustLABv1/justflow/apps/backend/functions/httperror"
	"github.com/JustLABv1/justflow/apps/backend/pkg/models"

	"github.com/gin-gonic/gin"
	"github.com/uptrace/bun"
)

func Hearbeat(context *gin.Context, db *bun.DB) {
	executionID := context.Param("executionID")

	_, err := db.NewUpdate().Model((*models.Executions)(nil)).Where("id = ?", executionID).Set("last_heartbeat = ?", time.Now()).Exec(context)
	if err != nil {
		httperror.InternalServerError(context, "Error updating execution hearbeat on db", err)
		return
	}

	context.JSON(http.StatusOK, gin.H{"result": "success"})
}
