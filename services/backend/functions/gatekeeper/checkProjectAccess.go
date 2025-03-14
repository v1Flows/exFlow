package gatekeeper

import (
	"net/http"

	"github.com/v1Flows/exFlow/services/backend/functions/auth"
	"github.com/v1Flows/exFlow/services/backend/functions/httperror"
	"github.com/v1Flows/exFlow/services/backend/pkg/models"

	"github.com/gin-gonic/gin"
	_ "github.com/lib/pq"
	"github.com/uptrace/bun"
)

func CheckUserProjectAccess(projectID string, context *gin.Context, db *bun.DB) (bool, error) {
	tokenString := context.GetHeader("Authorization")

	tokenType, err := auth.GetTypeFromToken(tokenString)
	if err != nil {
		httperror.InternalServerError(context, "Error checking for token type", err)
		return false, err
	}

	if tokenType == "project" || tokenType == "runner" || tokenType == "project_auto_runner" || tokenType == "exflow_auto_runner" {
		// check if projectID in runner token equals to the requested projectID
		tokenProjectID, err := auth.GetProjectIDFromToken(tokenString)
		if err != nil {
			httperror.InternalServerError(context, "Error checking for token type", err)
			return false, err
		}

		if tokenProjectID == "admin" {
			return true, nil
		}

		if tokenProjectID != projectID {
			return false, nil
		}

		return true, nil
	} else if tokenType == "user" {
		userID, err := auth.GetUserIDFromToken(tokenString)
		if err != nil {
			context.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			context.Abort()
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

		project := new(models.Projects)
		count, err := db.NewSelect().Model(project).Where("id = ?", projectID).Where("id::uuid IN (SELECT project_id::uuid FROM project_members WHERE user_id = ?)", userID).Count(context)
		if err != nil {
			return false, err
		}

		if count > 0 {
			return true, nil
		} else {
			return false, nil
		}
	} else if tokenType == "service" {
		return true, nil
	}

	return false, nil
}
