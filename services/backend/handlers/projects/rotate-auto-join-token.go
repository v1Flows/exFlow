package projects

import (
	"errors"
	"net/http"

	"github.com/v1Flows/exFlow/services/backend/functions/gatekeeper"
	"github.com/v1Flows/exFlow/services/backend/functions/httperror"
	functions_runner "github.com/v1Flows/exFlow/services/backend/functions/runner"
	"github.com/v1Flows/exFlow/services/backend/pkg/models"

	"github.com/gin-gonic/gin"
	_ "github.com/lib/pq"
	log "github.com/sirupsen/logrus"
	"github.com/uptrace/bun"
)

func RotateAutoJoinToken(context *gin.Context, db *bun.DB) {
	projectID := context.Param("projectID")

	// check if user has access to project
	access, err := gatekeeper.CheckUserProjectAccess(projectID, context, db)
	if err != nil {
		httperror.InternalServerError(context, "Error checking for project access", err)
		return
	}
	if !access {
		httperror.Unauthorized(context, "You do not have access to this project", errors.New("you do not have access to this project"))
		return
	}

	var project models.Projects
	var tokens models.Tokens

	// delete all existing auto join tokens for the project
	_, err = db.NewDelete().Model(&tokens).Where("project_id = ? and type = ?", projectID, "project_auto_runner").Exec(context)
	if err != nil {
		log.Error(err)
		httperror.InternalServerError(context, "Error deleting existing auto join tokens", err)
		return
	}

	project.RunnerAutoJoinToken, err = functions_runner.GenerateProjectAutoJoinToken(projectID, db)
	if err != nil {
		return
	}

	_, err = db.NewUpdate().Model(&project).Column("runner_auto_join_token").Where("id = ?", projectID).Exec(context)
	if err != nil {
		log.Error(err)
		httperror.InternalServerError(context, "Error creating project on db", err)
		return
	}

	context.JSON(http.StatusCreated, gin.H{"result": "success"})
}
