package runners

import (
	"github.com/v1Flows/exFlow/services/backend/functions/gatekeeper"
	"github.com/v1Flows/exFlow/services/backend/functions/httperror"
	"github.com/v1Flows/exFlow/services/backend/pkg/models"
	"errors"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	_ "github.com/lib/pq"
	"github.com/uptrace/bun"
)

func DeleteRunner(context *gin.Context, db *bun.DB) {
	runnerID := context.Param("runnerID")

	// get runner data
	var runner models.Runners
	err := db.NewSelect().Model(&runner).Where("id = ?", runnerID).Scan(context)
	if err != nil {
		httperror.InternalServerError(context, "Error collecting runner data from db", err)
		return
	}

	// check the requestors role in project
	canModify, err := gatekeeper.CheckRequestUserProjectModifyRole(runner.ProjectID, context, db)
	if err != nil {
		httperror.InternalServerError(context, "Error checking your user permissions on project", err)
		return
	}
	if !canModify {
		httperror.Unauthorized(context, "You are not allowed to delete runners for this project", errors.New("unauthorized"))
		return
	}

	_, err = db.NewDelete().Model((*models.Runners)(nil)).Where("id = ?", runnerID).Exec(context)
	if err != nil {
		httperror.InternalServerError(context, "Error deleting runner on db", err)
		return
	}

	var flows models.Flows
	flows.UpdatedAt = time.Now()
	_, err = db.NewUpdate().Model(&flows).Column("maintenance", "maintenance_message", "updated_at").Set("maintenance = ?", true).Set("maintenance_message = ?", "Runner deleted. Please assign a new one").Set("updated_at = ?", time.Now()).Where("runner_id = ?", runnerID).Exec(context)
	if err != nil {
		httperror.InternalServerError(context, "Error updating flows runner was assigned to", err)
		return
	}

	context.JSON(http.StatusOK, gin.H{"result": "success"})
}
