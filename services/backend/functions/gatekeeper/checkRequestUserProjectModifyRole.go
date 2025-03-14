package gatekeeper

import (
	"github.com/v1Flows/exFlow/services/backend/functions/auth"
	"github.com/v1Flows/exFlow/services/backend/functions/httperror"
	"github.com/v1Flows/exFlow/services/backend/pkg/models"

	"github.com/gin-gonic/gin"
	"github.com/uptrace/bun"
)

func CheckRequestUserProjectModifyRole(projectID string, context *gin.Context, db *bun.DB) (bool, error) {
	userID, err := auth.GetUserIDFromToken(context.GetHeader("Authorization"))
	if err != nil {
		httperror.InternalServerError(context, "Error receiving userID from token", err)
		return false, err
	}

	isAdmin, err := CheckAdmin(userID, db)
	if err != nil {
		httperror.InternalServerError(context, "Error checking if user is admin", err)
		return false, err
	}
	if isAdmin {
		return true, nil
	}

	var member models.ProjectMembers
	err = db.NewSelect().Model(&member).Where("project_id = ? AND user_id = ?", projectID, userID).Scan(context)
	if err != nil {
		return false, err
	}

	if member.Role == "Owner" || member.Role == "Editor" {
		return true, nil
	}

	return false, nil
}
