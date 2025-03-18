package folders

import (
	"net/http"

	"github.com/v1Flows/exFlow/services/backend/functions/auth"
	"github.com/v1Flows/exFlow/services/backend/functions/httperror"
	"github.com/v1Flows/exFlow/services/backend/pkg/models"

	"github.com/gin-gonic/gin"
	_ "github.com/lib/pq"
	"github.com/uptrace/bun"
)

func GetFolders(context *gin.Context, db *bun.DB) {
	userID, err := auth.GetUserIDFromToken(context.GetHeader("Authorization"))
	if err != nil {
		httperror.InternalServerError(context, "Error receiving userID from token", err)
		return
	}

	folders := make([]models.Folders, 0)
	count, err := db.NewSelect().Model(&folders).Where("project_id::uuid IN (SELECT project_id::uuid FROM project_members WHERE user_id = ? AND invite_pending = false)", userID).ScanAndCount(context)
	if err != nil {
		httperror.InternalServerError(context, "Error collecting folders from db", err)
		return
	}

	context.JSON(http.StatusOK, gin.H{"folders": folders, "count": count})
}
