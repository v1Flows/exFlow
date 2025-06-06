package projects

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

func GetProject(context *gin.Context, db *bun.DB) {
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

	var project struct {
		models.Projects
		Members []models.ProjectMembersWithUserData `json:"members"`
	}

	err = db.NewSelect().
		Model(&project.Projects).
		Where("id = ?", projectID).
		Scan(context)
	if err != nil {
		httperror.InternalServerError(context, "Error receiving project information from db", err)
		return
	}

	err = db.NewRaw("SELECT project_members.*, us.username, us.email FROM project_members JOIN users AS us ON us.id::uuid = project_members.user_id::uuid WHERE project_members.project_id = ? ORDER BY CASE WHEN project_members.role = 'Owner' THEN 1 WHEN project_members.role = 'Editor' THEN 2 ELSE 3 END", projectID).
		Scan(context, &project.Members)
	if err != nil {
		httperror.InternalServerError(context, "Error receiving project members from db", err)
		return
	}

	context.JSON(http.StatusOK, gin.H{"project": project})
}
