package tokens

import (
	"github.com/v1Flows/exFlow/services/backend/functions/gatekeeper"
	"github.com/v1Flows/exFlow/services/backend/functions/httperror"
	"github.com/v1Flows/exFlow/services/backend/pkg/models"
	"errors"
	"net/http"

	"github.com/gin-gonic/gin"
	_ "github.com/lib/pq"
	"github.com/uptrace/bun"
)

func UpdateToken(context *gin.Context, db *bun.DB) {
	id := context.Param("id")

	var token models.Tokens
	if err := context.ShouldBindJSON(&token); err != nil {
		httperror.StatusBadRequest(context, "Error parsing incoming data", err)
		return
	}

	// get token from db
	var dbToken models.Tokens
	err := db.NewSelect().Model(&dbToken).Where("id = ?", id).Scan(context)
	if err != nil {
		httperror.InternalServerError(context, "Error getting token from db", err)
		return
	}

	// check the requestors role in project
	canModify, err := gatekeeper.CheckRequestUserProjectModifyRole(dbToken.ProjectID, context, db)
	if err != nil {
		httperror.InternalServerError(context, "Error checking your user permissions on project", err)
		return
	}
	if !canModify {
		httperror.Unauthorized(context, "You are not allowed to make modifications on this project", errors.New("unauthorized"))
		return
	}

	_, err = db.NewUpdate().Model(&token).Column("description").Where("id = ?", id).Exec(context)
	if err != nil {
		httperror.InternalServerError(context, "Error updating token on db", err)
		return
	}

	context.JSON(http.StatusCreated, gin.H{"result": "success"})
}
