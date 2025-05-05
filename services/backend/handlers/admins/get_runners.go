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
	err := db.NewSelect().Model(&selfhostedRunners).Where("shared_runner = false").Scan(context)
	if err != nil {
		httperror.InternalServerError(context, "Error collecting runners data on db", err)
		return
	}

	exflowRunners := make([]models.Runners, 0)
	err = db.NewSelect().Model(&exflowRunners).Where("shared_runner = true").Scan(context)
	if err != nil {
		httperror.InternalServerError(context, "Error collecting runners data on db", err)
		return
	}

	runners := make([]models.Runners, 0)
	err = db.NewSelect().Model(&runners).Scan(context)
	if err != nil {
		httperror.InternalServerError(context, "Error collecting runners data on db", err)
		return
	}

	context.JSON(http.StatusOK, gin.H{"runners": runners, "self_hosted_runners": selfhostedRunners, "shared_runners": exflowRunners})
}
