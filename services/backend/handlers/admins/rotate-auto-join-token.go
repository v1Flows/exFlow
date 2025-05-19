package admins

import (
	"net/http"

	"github.com/v1Flows/exFlow/services/backend/functions/httperror"
	functions_runner "github.com/v1Flows/exFlow/services/backend/functions/runner"
	"github.com/v1Flows/exFlow/services/backend/pkg/models"

	"github.com/gin-gonic/gin"
	_ "github.com/lib/pq"
	"github.com/uptrace/bun"
)

func RotateAutoJoinToken(context *gin.Context, db *bun.DB) {
	var settings models.Settings
	var err error
	settings.SharedRunnerAutoJoinToken, err = functions_runner.GenerateExFlowAutoJoinToken(db)
	if err != nil {
		httperror.InternalServerError(context, "Error rotating shared runner token", err)
		return
	}

	_, err = db.NewUpdate().Model(&settings).Column("shared_runner_auto_join_token").Where("id = 1").Exec(context)
	if err != nil {
		httperror.InternalServerError(context, "Error rotating shared runner token", err)
		return
	}

	context.JSON(http.StatusCreated, gin.H{"result": "success"})
}
