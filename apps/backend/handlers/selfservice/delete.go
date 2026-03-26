package selfservice

import (
	"errors"
	"net/http"

	"github.com/JustLABv1/justflow/apps/backend/functions/gatekeeper"
	"github.com/JustLABv1/justflow/apps/backend/functions/httperror"
	"github.com/JustLABv1/justflow/apps/backend/pkg/models"

	"github.com/gin-gonic/gin"
	"github.com/uptrace/bun"
)

func DeletePage(context *gin.Context, db *bun.DB) {
	pageID := context.Param("pageID")

	var page models.SelfServicePage
	if err := db.NewSelect().Model(&page).Where("id = ?", pageID).Scan(context); err != nil {
		httperror.InternalServerError(context, "Error fetching self-service page", err)
		return
	}

	canManage, err := gatekeeper.CheckSelfServicePageManageAccess(page.ProjectID, context, db)
	if err != nil {
		httperror.InternalServerError(context, "Error checking permissions", err)
		return
	}
	if !canManage {
		httperror.Unauthorized(context, "You are not allowed to delete this self-service page", errors.New("unauthorized"))
		return
	}

	_, err = db.NewDelete().Model(&page).Where("id = ?", pageID).Exec(context)
	if err != nil {
		httperror.InternalServerError(context, "Error deleting self-service page", err)
		return
	}

	context.JSON(http.StatusOK, gin.H{"result": "success"})
}
