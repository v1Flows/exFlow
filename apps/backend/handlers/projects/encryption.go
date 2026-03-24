package projects

import (
	"errors"
	"net/http"

	"github.com/JustLABv1/justflow/apps/backend/functions/encryption"
	"github.com/JustLABv1/justflow/apps/backend/functions/gatekeeper"
	"github.com/JustLABv1/justflow/apps/backend/functions/httperror"
	"github.com/JustLABv1/justflow/apps/backend/pkg/models"

	"github.com/gin-gonic/gin"
	"github.com/uptrace/bun"
)

// GetProjectEncryptionStatus returns the encryption status for a project
func GetProjectEncryptionStatus(context *gin.Context, db *bun.DB) {
	projectID := context.Param("projectID")

	// check if user has access to project
	access, err := gatekeeper.CheckUserProjectAccess(projectID, context, db)
	if err != nil {
		httperror.InternalServerError(context, "Error checking for project access", err)
		return
	}
	if !access {
		httperror.Unauthorized(context, "You do not have access to this project", errors.New("you do not have access to this project"))
		return
	}

	var project models.Projects
	err = db.NewSelect().Model(&project).Where("id = ?", projectID).Scan(context)
	if err != nil {
		httperror.InternalServerError(context, "Error receiving project data from db", err)
		return
	}

	response := gin.H{
		"encryption_enabled":  project.EncryptionEnabled,
		"has_encryption_salt": project.EncryptionKey != "",
	}

	context.JSON(http.StatusOK, response)
}

// EnableProjectEncryption enables encryption for a project
func EnableProjectEncryption(context *gin.Context, db *bun.DB) {
	projectID := context.Param("projectID")

	// check if user has access to project
	access, err := gatekeeper.CheckUserProjectAccess(projectID, context, db)
	if err != nil {
		httperror.InternalServerError(context, "Error checking for project access", err)
		return
	}
	if !access {
		httperror.Unauthorized(context, "You do not have access to this project", errors.New("you do not have access to this project"))
		return
	}

	// check the requestors role in project (only owners and editors can manage encryption)
	canModify, err := gatekeeper.CheckRequestUserProjectModifyRole(projectID, context, db)
	if err != nil {
		httperror.InternalServerError(context, "Error checking your user permissions on project", err)
		return
	}
	if !canModify {
		httperror.Unauthorized(context, "You are not allowed to make modifications on this project", errors.New("unauthorized"))
		return
	}

	err = encryption.EnableProjectEncryption(projectID, db)
	if err != nil {
		httperror.InternalServerError(context, "Error enabling project encryption", err)
		return
	}

	context.JSON(http.StatusOK, gin.H{"result": "success", "message": "Project encryption enabled"})
}

// DisableProjectEncryption disables encryption for a project
func DisableProjectEncryption(context *gin.Context, db *bun.DB) {
	projectID := context.Param("projectID")

	// check if user has access to project
	access, err := gatekeeper.CheckUserProjectAccess(projectID, context, db)
	if err != nil {
		httperror.InternalServerError(context, "Error checking for project access", err)
		return
	}
	if !access {
		httperror.Unauthorized(context, "You do not have access to this project", errors.New("you do not have access to this project"))
		return
	}

	// check the requestors role in project (only owners and editors can manage encryption)
	canModify, err := gatekeeper.CheckRequestUserProjectModifyRole(projectID, context, db)
	if err != nil {
		httperror.InternalServerError(context, "Error checking your user permissions on project", err)
		return
	}
	if !canModify {
		httperror.Unauthorized(context, "You are not allowed to make modifications on this project", errors.New("unauthorized"))
		return
	}

	err = encryption.DisableProjectEncryption(projectID, db)
	if err != nil {
		httperror.InternalServerError(context, "Error disabling project encryption", err)
		return
	}

	context.JSON(http.StatusOK, gin.H{"result": "success", "message": "Project encryption disabled"})
}

// RotateProjectEncryptionKey generates a new encryption key for a project
func RotateProjectEncryptionKey(context *gin.Context, db *bun.DB) {
	projectID := context.Param("projectID")

	// check if user has access to project
	access, err := gatekeeper.CheckUserProjectAccess(projectID, context, db)
	if err != nil {
		httperror.InternalServerError(context, "Error checking for project access", err)
		return
	}
	if !access {
		httperror.Unauthorized(context, "You do not have access to this project", errors.New("you do not have access to this project"))
		return
	}

	// check the requestors role in project (only owners can rotate encryption keys)
	canModify, err := gatekeeper.CheckRequestUserProjectModifyRole(projectID, context, db)
	if err != nil {
		httperror.InternalServerError(context, "Error checking your user permissions on project", err)
		return
	}
	if !canModify {
		httperror.Unauthorized(context, "You are not allowed to make modifications on this project", errors.New("unauthorized"))
		return
	}

	_, err = encryption.RotateProjectEncryptionKey(projectID, db)
	if err != nil {
		httperror.InternalServerError(context, "Error rotating project encryption key", err)
		return
	}

	context.JSON(http.StatusOK, gin.H{
		"result":  "success",
		"message": "Project encryption salt rotated successfully. Existing encrypted data will continue to work with the old salt until re-encrypted.",
	})
}
