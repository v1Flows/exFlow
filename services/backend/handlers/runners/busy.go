package runners

import (
	"errors"
	"net/http"

	"github.com/v1Flows/exFlow/services/backend/functions/httperror"
	"github.com/v1Flows/exFlow/services/backend/pkg/models"

	"github.com/gin-gonic/gin"
	"github.com/uptrace/bun"
)

func Busy(context *gin.Context, db *bun.DB) {
	runnerID := context.Param("runnerID")

	var runner models.Runners
	if err := context.ShouldBindJSON(&runner); err != nil {
		httperror.StatusBadRequest(context, "Error parsing incoming data", err)
		return
	}

	// check if runner is disabled
	var runnerDB models.Runners
	err := db.NewSelect().Model(&runnerDB).Where("id = ?", runnerID).Scan(context)
	if err != nil {
		httperror.InternalServerError(context, "Error collecting runner data from db", err)
		return
	}
	if runnerDB.Disabled {
		httperror.StatusBadRequest(context, "Runner is disabled", errors.New("runner is disabled"))
		return
	}

	_, err = db.NewUpdate().Model(&runner).Column("executing_job").Where("id = ?", runnerID).Exec(context)
	if err != nil {
		httperror.InternalServerError(context, "Error updating runner informations on db", err)
		return
	}

	context.JSON(http.StatusCreated, gin.H{"result": "success"})
}
