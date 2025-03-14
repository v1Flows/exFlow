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

func UpdateToken(context *gin.Context, db *bun.DB) {
	projectID := context.Param("projectID")
	tokenID := context.Param("tokenID")

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

	// check the requestors role in project
	canModify, err := gatekeeper.CheckRequestUserProjectModifyRole(projectID, context, db)
	if err != nil {
		httperror.InternalServerError(context, "Error checking your user permissions on project", err)
		return
	}
	if !canModify {
		httperror.Unauthorized(context, "You are not allowed to make modifications on this project", errors.New("unauthorized"))
		return
	}

	var token models.Tokens
	if err := context.ShouldBindJSON(&token); err != nil {
		httperror.StatusBadRequest(context, "Error parsing incoming data", err)
		return
	}

	_, err = db.NewUpdate().Model(&token).Column("disabled", "disabled_reason").Where("id = ?", tokenID).Exec(context)
	if err != nil {
		httperror.InternalServerError(context, "Error updating token informations on db", err)
	}

	context.JSON(http.StatusCreated, gin.H{"result": "success"})
}
