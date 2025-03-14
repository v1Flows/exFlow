package admins

import (
	"net/http"

	"github.com/v1Flows/exFlow/services/backend/functions/httperror"
	functions_runner "github.com/v1Flows/exFlow/services/backend/functions/runner"
	"github.com/v1Flows/exFlow/services/backend/pkg/models"

	"github.com/gin-gonic/gin"
	"github.com/uptrace/bun"
)

func GetSettings(context *gin.Context, db *bun.DB) {
	var settings models.Settings
	err := db.NewSelect().Model(&settings).Where("id = 1").Scan(context)
	if err != nil {
		httperror.InternalServerError(context, "Error collecting settings data on db", err)
		return
	}

	// regenerate ExFlowRunnerAutoJoinToken if it got deleted or is not existing
	if settings.ExFlowRunnerAutoJoinToken == "" {
		settings.ExFlowRunnerAutoJoinToken, err = functions_runner.GenerateExFlowAutoJoinToken(db)
		if err != nil {
			httperror.InternalServerError(context, "Error generating ExFlowRunnerAutoJoinToken", err)
			return
		}
		_, err = db.NewUpdate().Model(&settings).Set("exflow_runner_auto_join_token = ?", settings.ExFlowRunnerAutoJoinToken).Where("id = 1").Exec(context)
		if err != nil {
			httperror.InternalServerError(context, "Error updating ExFlowRunnerAutoJoinToken on db", err)
			return
		}
	}

	context.JSON(http.StatusOK, gin.H{"settings": settings})
}
