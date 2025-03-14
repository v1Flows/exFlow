package tokens

import (
	"github.com/v1Flows/exFlow/services/backend/functions/gatekeeper"
	"github.com/v1Flows/exFlow/services/backend/functions/httperror"
	"github.com/v1Flows/exFlow/services/backend/pkg/models"
	"errors"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/uptrace/bun"
)

func DeleteRunnerToken(context *gin.Context, db *bun.DB) {
	tokenID := context.Param("apikey")

	// get token from db
	var key models.Tokens
	err := db.NewSelect().Model(&key).Where("id = ?", tokenID).Scan(context)
	if err != nil {
		httperror.InternalServerError(context, "Error getting token from db", err)
		return
	}

	// check the requestors role in project
	canModify, err := gatekeeper.CheckRequestUserProjectModifyRole(key.ProjectID, context, db)
	if err != nil {
		httperror.InternalServerError(context, "Error checking your user permissions on project", err)
		return
	}
	if !canModify {
		httperror.Unauthorized(context, "You are not allowed to make modifications on this project", errors.New("unauthorized"))
		return
	}

	_, err = db.NewDelete().Model(&key).Where("id = ?", tokenID).Exec(context)
	if err != nil {
		httperror.InternalServerError(context, "Error deleting token from db", err)
		return
	}

	context.JSON(http.StatusOK, gin.H{"result": "success"})
}
