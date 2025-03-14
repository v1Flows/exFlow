package projects

import (
	"github.com/v1Flows/exFlow/services/backend/functions/auth"
	"github.com/v1Flows/exFlow/services/backend/functions/httperror"
	"github.com/v1Flows/exFlow/services/backend/pkg/models"
	"errors"

	"github.com/gin-gonic/gin"
	"github.com/uptrace/bun"
)

func TransferOwnership(context *gin.Context, db *bun.DB) {
	projectID := context.Param("projectID")

	// new owner
	var new_owner models.ProjectMembers
	if err := context.ShouldBindJSON(&new_owner); err != nil {
		httperror.StatusBadRequest(context, "Error parsing incoming data", err)
		return
	}

	userID, err := auth.GetUserIDFromToken(context.GetHeader("Authorization"))
	if err != nil {
		httperror.InternalServerError(context, "Error receiving userID from token", err)
		return
	}

	// check if new owner is a member of the project
	count, err := db.NewSelect().Model(&new_owner).Where("project_id = ? AND user_id = ?", projectID, new_owner.UserID).ScanAndCount(context)
	if err != nil {
		httperror.InternalServerError(context, "Error receiving new owner informations from db", err)
		return
	}

	if count == 0 {
		httperror.StatusBadRequest(context, "New owner is not a member of this project", errors.New("new owner is not a member of this project"))
		return
	}

	// get requestor details
	var requestor models.ProjectMembers
	err = db.NewSelect().Model(&requestor).Where("project_id = ? AND user_id = ?", projectID, userID).Scan(context)
	if err != nil {
		httperror.InternalServerError(context, "Error receiving your project member informations from db", err)
		return
	}

	if requestor.Role != "Owner" {
		httperror.Unauthorized(context, "You are not the owner of this project", errors.New("you are not the owner of this project"))
		return
	}

	// set new owner
	new_owner.Role = "Owner"
	_, err = db.NewUpdate().Model(&new_owner).Where("project_id = ? AND user_id = ?", projectID, new_owner.UserID).Set("role = ?", new_owner.Role).Exec(context)
	if err != nil {
		httperror.InternalServerError(context, "Error updating new owner", err)
		return
	}

	// set old owner
	requestor.Role = "Viewer"
	_, err = db.NewUpdate().Model(&requestor).Where("project_id = ? AND user_id = ?", projectID, requestor.UserID).Set("role = ?", requestor.Role).Exec(context)
	if err != nil {
		httperror.InternalServerError(context, "Error updating old owner", err)
		return
	}

	context.JSON(200, gin.H{
		"message": "Ownership transfered successfully",
	})
}
