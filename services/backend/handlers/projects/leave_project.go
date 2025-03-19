package projects

import (
	"github.com/v1Flows/exFlow/services/backend/functions/auth"
	"github.com/v1Flows/exFlow/services/backend/functions/httperror"
	functions_project "github.com/v1Flows/exFlow/services/backend/functions/project"
	functions "github.com/v1Flows/exFlow/services/backend/functions/user"
	"github.com/v1Flows/exFlow/services/backend/pkg/models"
	"errors"
	"net/http"

	"github.com/gin-gonic/gin"
	_ "github.com/lib/pq"
	log "github.com/sirupsen/logrus"
	"github.com/uptrace/bun"
)

func LeaveProject(context *gin.Context, db *bun.DB) {
	projectID := context.Param("projectID")

	userID, err := auth.GetUserIDFromToken(context.GetHeader("Authorization"))
	if err != nil {
		httperror.InternalServerError(context, "Error receiving userID from token", err)
		return
	}

	// get member data
	var member models.ProjectMembers
	err = db.NewSelect().Model(&member).Where("project_id = ? AND user_id = ?", projectID, userID).Scan(context)
	if err != nil {
		httperror.InternalServerError(context, "Error receiving your project member informations from db", err)
		return
	}

	// stop if user is owner
	if member.Role == "Owner" {
		httperror.StatusBadRequest(context, "You can't leave the project as owner", errors.New("you can't leave the project as owner"))
		return
	}

	_, err = db.NewDelete().Model(&member).Where("project_id = ? AND user_id = ?", projectID, userID).Exec(context)
	if err != nil {
		httperror.InternalServerError(context, "Error receiving your project member informations from db", err)
		return
	}

	// get project data
	var project models.Projects
	err = db.NewSelect().Model(&project).Where("id = ?", projectID).Scan(context)
	if err != nil {
		httperror.InternalServerError(context, "Error collecting project informations from db", err)
		return
	}

	// Notification
	err = functions.SendUserNotification(userID.String(), "Leaving Project", "You left the project "+project.Name, "solar:file-remove-broken", "primary", "/dashboard/projects", "To Projects", db)
	if err != nil {
		httperror.InternalServerError(context, "Error sending notification", err)
		return
	}

	// Audit
	err = functions_project.CreateAuditEntry(projectID, "info", "User left the project", db, context)
	if err != nil {
		log.Error(err)
	}

	context.JSON(http.StatusOK, gin.H{"result": "success"})
}
