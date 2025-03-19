package folders

import (
	"errors"
	"net/http"

	"github.com/v1Flows/exFlow/services/backend/functions/gatekeeper"
	"github.com/v1Flows/exFlow/services/backend/functions/httperror"
	functions_project "github.com/v1Flows/exFlow/services/backend/functions/project"
	"github.com/v1Flows/exFlow/services/backend/pkg/models"

	"github.com/gin-gonic/gin"
	_ "github.com/lib/pq"
	log "github.com/sirupsen/logrus"
	"github.com/uptrace/bun"
)

func UpdateFolder(context *gin.Context, db *bun.DB) {
	folderID := context.Param("folderID")

	var folder models.Folders
	if err := context.ShouldBindJSON(&folder); err != nil {
		httperror.StatusBadRequest(context, "Error parsing incoming data", err)
		return
	}

	// check if user has access to project
	access, err := gatekeeper.CheckUserProjectAccess(folder.ProjectID, context, db)
	if err != nil {
		httperror.InternalServerError(context, "Error checking for project access", err)
		return
	}
	if !access {
		httperror.Unauthorized(context, "You do not have access to this project/folder", errors.New("you do not have access to this project/folder"))
		return
	}

	// check the requestors role in project
	canModify, err := gatekeeper.CheckRequestUserProjectModifyRole(folder.ProjectID, context, db)
	if err != nil {
		httperror.InternalServerError(context, "Error checking your user permissions on folder", err)
		return
	}
	if !canModify {
		httperror.Unauthorized(context, "You are not allowed to make modifications on this folder", errors.New("unauthorized"))
		return
	}

	columns := []string{}
	if folder.Name != "" {
		columns = append(columns, "name")
	}
	if folder.Description != "" {
		columns = append(columns, "description")
	}
	if folder.ProjectID != "" {
		columns = append(columns, "project_id")
	}
	if folder.ParentID != "" {
		columns = append(columns, "parent_id")
	}

	_, err = db.NewUpdate().Model(&folder).Column(columns...).Where("id = ?", folderID).Exec(context)
	if err != nil {
		httperror.InternalServerError(context, "Error updating folder on db", err)
		return
	}

	// Audit
	err = functions_project.CreateAuditEntry(folder.ProjectID, "update", "Folder updated: "+folder.Name, db, context)
	if err != nil {
		log.Error(err)
	}

	context.JSON(http.StatusCreated, gin.H{"result": "success"})
}
