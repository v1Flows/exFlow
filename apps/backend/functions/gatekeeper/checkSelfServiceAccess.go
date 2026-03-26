package gatekeeper

import (
	"github.com/JustLABv1/justflow/apps/backend/functions/auth"
	"github.com/JustLABv1/justflow/apps/backend/functions/httperror"
	"github.com/JustLABv1/justflow/apps/backend/pkg/models"

	"github.com/gin-gonic/gin"
	"github.com/uptrace/bun"
)

// CheckSelfServicePageAccess returns true if the current user can view/use the page.
// Any project member (Owner, Editor, Viewer) has access. Admins always have access.
// Returns false, nil when the user simply lacks membership (not an error).
func CheckSelfServicePageAccess(projectID string, context *gin.Context, db *bun.DB) (bool, error) {
	tokenString := context.GetHeader("Authorization")

	tokenType, err := auth.GetTypeFromToken(tokenString)
	if err != nil {
		httperror.InternalServerError(context, "Error checking for token type", err)
		return false, err
	}

	// Non-user tokens (project, service, runner) get blanket access
	if tokenType != "user" {
		return true, nil
	}

	userID, err := auth.GetUserIDFromToken(tokenString)
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

	// Check project membership (any role)
	count, err := db.NewSelect().
		Model((*models.ProjectMembers)(nil)).
		Where("project_id = ? AND user_id = ? AND invite_pending = FALSE", projectID, userID).
		Count(context)
	if err != nil {
		return false, err
	}

	return count > 0, nil
}

// CheckSelfServicePageManageAccess returns true if the current user can create/edit/delete pages.
// Requires admin or editor global role, OR project Owner/Editor membership.
func CheckSelfServicePageManageAccess(projectID string, context *gin.Context, db *bun.DB) (bool, error) {
	tokenString := context.GetHeader("Authorization")

	tokenType, err := auth.GetTypeFromToken(tokenString)
	if err != nil {
		httperror.InternalServerError(context, "Error checking for token type", err)
		return false, err
	}

	if tokenType == "service" {
		return true, nil
	}

	if tokenType != "user" {
		return false, nil
	}

	userID, err := auth.GetUserIDFromToken(tokenString)
	if err != nil {
		httperror.InternalServerError(context, "Error receiving userID from token", err)
		return false, err
	}

	// Global admin or editor can manage any page
	isEditorOrAdmin, err := CheckEditorOrAdmin(userID, db)
	if err != nil {
		httperror.InternalServerError(context, "Error checking user role", err)
		return false, err
	}
	if isEditorOrAdmin {
		return true, nil
	}

	// Project-level Owner or Editor can also manage pages
	var member models.ProjectMembers
	err = db.NewSelect().Model(&member).
		Where("project_id = ? AND user_id = ?", projectID, userID).
		Scan(context)
	if err != nil {
		return false, err
	}

	return member.Role == "Owner" || member.Role == "Editor", nil
}
