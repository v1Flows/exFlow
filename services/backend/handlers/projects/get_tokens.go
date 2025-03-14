package projects

import (
	"github.com/v1Flows/exFlow/services/backend/functions/gatekeeper"
	"github.com/v1Flows/exFlow/services/backend/functions/httperror"
	"github.com/v1Flows/exFlow/services/backend/pkg/models"
	"errors"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/uptrace/bun"
)

func GetProjectTokens(context *gin.Context, db *bun.DB) {
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

	tokens := make([]models.Tokens, 0)
	err = db.NewSelect().Model(&tokens).Where("project_id = ? and type != 'project_auto_runner'", projectID).Order("expires_at asc").Scan(context)
	if err != nil {
		httperror.InternalServerError(context, "Error receiving project tokens from db", err)
		return
	}

	context.JSON(http.StatusOK, gin.H{"tokens": tokens})
}
