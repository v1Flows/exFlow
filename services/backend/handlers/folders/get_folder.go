package folders

import (
	"errors"
	"net/http"

	"github.com/v1Flows/exFlow/services/backend/functions/gatekeeper"
	"github.com/v1Flows/exFlow/services/backend/functions/httperror"
	"github.com/v1Flows/exFlow/services/backend/pkg/models"

	"github.com/gin-gonic/gin"
	_ "github.com/lib/pq"
	"github.com/uptrace/bun"
)

func GetFolder(context *gin.Context, db *bun.DB) {
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
		httperror.InternalServerError(context, "Error checking for folder access", err)
		return
	}
	if !access {
		httperror.Unauthorized(context, "You do not have access to this folder", errors.New("you do not have access to this folder"))
		return
	}

	context.JSON(http.StatusOK, gin.H{"folder": folder})
}
