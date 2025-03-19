package runners

import (
	"errors"
	"net/http"

	"github.com/v1Flows/exFlow/services/backend/functions/auth"
	"github.com/v1Flows/exFlow/services/backend/functions/gatekeeper"
	"github.com/v1Flows/exFlow/services/backend/functions/httperror"
	functions_runner "github.com/v1Flows/exFlow/services/backend/functions/runner"
	"github.com/v1Flows/exFlow/services/backend/pkg/models"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"github.com/uptrace/bun"
)

func CreateRunner(context *gin.Context, db *bun.DB) {
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
		httperror.Unauthorized(context, "You are not allowed to create runners for this project", errors.New("unauthorized"))
		return
	}

	runner.ID = uuid.New()

	if runner.SharedRunner {
		userID, err := auth.GetUserIDFromToken(context.GetHeader("Authorization"))
		if err != nil {
			httperror.InternalServerError(context, "Error collecting userID from token", err)
			return
		}

		isAdmin, err := gatekeeper.CheckAdmin(userID, db)
		if err != nil {
			httperror.InternalServerError(context, "Error checking for users role", err)
			return
		}
		if !isAdmin {
			httperror.Unauthorized(context, "You are not allowed to create this type of runner", errors.New("unauthorized"))
			return
		}
	}

	_, err = db.NewInsert().Model(&runner).Column("id", "name", "project_id", "shared_runner").Exec(context)
	if err != nil {
		httperror.InternalServerError(context, "Error creating runner on db", err)
		return
	}

	// generate token for runner
	token, err := functions_runner.GenerateRunnerToken(runner.ProjectID, runner.ID.String(), db)
	if err != nil {
		httperror.InternalServerError(context, "Error generating runner token", err)
		return
	}

	context.JSON(http.StatusCreated, gin.H{"result": "success", "runner": runner, "token": token})
}
