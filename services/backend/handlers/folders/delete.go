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

func DeleteFolder(context *gin.Context, db *bun.DB) {
	folderID := context.Param("folderID")

	var folder models.Folders
	err := db.NewSelect().Model(&folder).Where("id = ?", folderID).Scan(context)
	if err != nil {
		httperror.InternalServerError(context, "Error collecting folder data from db", err)
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
		httperror.InternalServerError(context, "Error checking your user permissions on project", err)
		return
	}
	if !canModify {
		httperror.Unauthorized(context, "You are not allowed to make modifications on this folder", errors.New("unauthorized"))
		return
	}

	_, err = db.NewDelete().Model((*models.Folders)(nil)).Where("id = ?", folderID).Exec(context)
	if err != nil {
		httperror.InternalServerError(context, "Error deleting flow from db", err)
		return
	}

	// remove parent_id from all folders in folder
	_, err = db.NewUpdate().Model((*models.Folders)(nil)).Set("parent_id = ''").Where("parent_id = ?", folderID).Exec(context)
	if err != nil {
		httperror.InternalServerError(context, "Error removing parent_id from folders", err)
		return
	}

	// remove folder_id from all flows in folder
	_, err = db.NewUpdate().Model((*models.Flows)(nil)).Set("folder_id = ''").Where("folder_id = ?", folderID).Exec(context)
	if err != nil {
		httperror.InternalServerError(context, "Error removing folder_id from flows", err)
		return
	}

	// Audit
	err = functions_project.CreateAuditEntry(folder.ProjectID, "delete", "Folder deleted: "+folder.Name, db, context)
	if err != nil {
		log.Error(err)
	}

	context.JSON(http.StatusOK, gin.H{"result": "success"})
}
