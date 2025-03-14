package admins

import (
	"github.com/v1Flows/exFlow/services/backend/functions/httperror"
	"github.com/v1Flows/exFlow/services/backend/pkg/models"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/uptrace/bun"
)

func ChangeRunnerStatus(context *gin.Context, db *bun.DB) {
	runnerID := context.Param("runnerID")

	var runner models.Runners
	if err := context.ShouldBindJSON(&runner); err != nil {
		httperror.StatusBadRequest(context, "Error parsing incoming data", err)
		return
	}

	_, err := db.NewUpdate().Model(&runner).Column("disabled", "disabled_reason").Where("id = ?", runnerID).Exec(context)
	if err != nil {
		httperror.InternalServerError(context, "Error updating runner on db", err)
		return
	}

	context.JSON(http.StatusOK, gin.H{"result": "success"})
}
