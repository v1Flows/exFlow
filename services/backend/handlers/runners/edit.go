package runners

import (
	"github.com/v1Flows/exFlow/services/backend/functions/gatekeeper"
	"github.com/v1Flows/exFlow/services/backend/functions/httperror"
	"github.com/v1Flows/exFlow/services/backend/pkg/models"
	"errors"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/uptrace/bun"
)

func EditRunner(context *gin.Context, db *bun.DB) {
	runnerID := context.Param("runnerID")

	var runner models.Runners
	if err := context.ShouldBindJSON(&runner); err != nil {
		httperror.StatusBadRequest(context, "Error parsing incoming data", err)
		return
	}

	// check the requestors role in project
	canModify, err := gatekeeper.CheckRequestUserProjectModifyRole(runner.ProjectID, context, db)
	if err != nil {
		httperror.InternalServerError(context, "Error checking your user permissions on project", err)
		return
	}
	if !canModify {
		httperror.Unauthorized(context, "You are not allowed to edit runners for this project", errors.New("unauthorized"))
		return
	}

	_, err = db.NewUpdate().Model(&runner).Column("name").Where("id = ?", runnerID).Exec(context)
	if err != nil {
		httperror.InternalServerError(context, "Error updating runner on db", err)
		return
	}

	context.JSON(http.StatusOK, gin.H{"result": "success"})
}
