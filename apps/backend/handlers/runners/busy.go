package runners

import (
	"errors"
	"net/http"

	"github.com/JustLABv1/justflow/apps/backend/functions/httperror"
	"github.com/JustLABv1/justflow/apps/backend/pkg/models"

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

	// Update executing_job only for non-disabled runners in a single query
	res, err := db.NewUpdate().Model(&runner).Column("executing_job").
		Where("id = ? AND disabled = false", runnerID).Exec(context)
	if err != nil {
		httperror.InternalServerError(context, "Error updating runner informations on db", err)
		return
	}

	rowsAffected, err := res.RowsAffected()
	if err != nil {
		httperror.InternalServerError(context, "Error checking rows affected", err)
		return
	}
	if rowsAffected == 0 {
		httperror.StatusBadRequest(context, "Runner is disabled or not found", errors.New("runner is disabled or not found"))
		return
	}

	context.JSON(http.StatusCreated, gin.H{"result": "success"})
}
