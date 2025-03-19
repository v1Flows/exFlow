package folders

import (
	"errors"
	"fmt"
	"net/http"

	"github.com/v1Flows/exFlow/services/backend/functions/gatekeeper"
	"github.com/v1Flows/exFlow/services/backend/functions/httperror"
	"github.com/v1Flows/exFlow/services/backend/pkg/models"

	"github.com/gin-gonic/gin"
	_ "github.com/lib/pq"
	log "github.com/sirupsen/logrus"
	"github.com/uptrace/bun"
)

func CreateFolder(context *gin.Context, db *bun.DB) {
	var folder models.Folders
	if err := context.ShouldBindJSON(&folder); err != nil {
		httperror.StatusBadRequest(context, "Error parsing incoming data", err)
		return
	}

	fmt.Println(folder)

	// check the requestors role in project
	canModify, err := gatekeeper.CheckRequestUserProjectModifyRole(folder.ProjectID, context, db)
	if err != nil {
		httperror.InternalServerError(context, "Error checking your user permissions on project", err)
		return
	}
	if !canModify {
		httperror.Unauthorized(context, "You are not allowed to create folders for this project", errors.New("unauthorized"))
		return
	}

	if folder.Name == "" {
		httperror.StatusBadRequest(context, "Name is required", errors.New("missing name"))
		return
	} else if len(folder.ProjectID) == 0 {
		httperror.StatusBadRequest(context, "Project ID is required", errors.New("missing project id"))
		return
	}

	_, err = db.NewInsert().Model(&folder).Column("name", "description", "parent_id", "project_id").Exec(context)
	if err != nil {
		log.Error(err)
		httperror.InternalServerError(context, "Error creating project on db", err)
		return
	}

	context.JSON(http.StatusCreated, gin.H{"result": "success"})
}
