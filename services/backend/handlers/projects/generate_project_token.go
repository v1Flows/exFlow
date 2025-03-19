package projects

import (
	"github.com/v1Flows/exFlow/services/backend/functions/auth"
	"github.com/v1Flows/exFlow/services/backend/functions/gatekeeper"
	"github.com/v1Flows/exFlow/services/backend/functions/httperror"
	"github.com/v1Flows/exFlow/services/backend/pkg/models"
	"errors"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"github.com/uptrace/bun"
)

func GenerateProjectToken(context *gin.Context, db *bun.DB) {
	projectID := context.Param("projectID")

	var incToken models.IncExpireTokenRequest
	if err := context.ShouldBindJSON(&incToken); err != nil {
		httperror.StatusBadRequest(context, "Error parsing incoming data", err)
		return
	}

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

	// generate api key
	var token models.Tokens
	token.ID = uuid.New()
	token.ProjectID = projectID
	token.Type = "project"
	token.Description = incToken.Description

	tokenKey, expirationTime, err := auth.GenerateProjectJWT(token.ProjectID, incToken.ExpiresIn, token.ID)
	if err != nil {
		httperror.InternalServerError(context, "Error generating token", err)
		return
	}

	token.Key = tokenKey
	token.ExpiresAt = expirationTime

	_, err = db.NewInsert().Model(&token).Exec(context)
	if err != nil {
		httperror.InternalServerError(context, "Error saving token", err)
		return
	}

	context.JSON(http.StatusCreated, gin.H{
		"key": tokenKey,
	})
}
