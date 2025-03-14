package admins

import (
	"net/http"

	"github.com/v1Flows/exFlow/services/backend/functions/httperror"
	"github.com/v1Flows/exFlow/services/backend/pkg/models"

	"github.com/gin-gonic/gin"
	"github.com/uptrace/bun"
)

func GetRunners(context *gin.Context, db *bun.DB) {
	selfhostedRunners := make([]models.Runners, 0)
	err := db.NewSelect().Model(&selfhostedRunners).Where("exflow_runner = false").Scan(context)
	if err != nil {
		httperror.InternalServerError(context, "Error collecting runners data on db", err)
		return
	}

	exflowRunners := make([]models.Runners, 0)
	err = db.NewSelect().Model(&exflowRunners).Where("exflow_runner = true").Scan(context)
	if err != nil {
		httperror.InternalServerError(context, "Error collecting runners data on db", err)
		return
	}

	context.JSON(http.StatusOK, gin.H{"self_hosted_runners": selfhostedRunners, "exflow_runners": exflowRunners})
}
