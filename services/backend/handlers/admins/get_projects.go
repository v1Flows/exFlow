package admins

import (
	"net/http"

	"github.com/v1Flows/exFlow/services/backend/functions/httperror"
	"github.com/v1Flows/exFlow/services/backend/pkg/models"

	"github.com/gin-gonic/gin"
	_ "github.com/lib/pq"
	"github.com/uptrace/bun"
)

func GetProjects(context *gin.Context, db *bun.DB) {
	projects := make([]models.Projects, 0)
	err := db.NewSelect().Model(&projects).Scan(context)
	if err != nil {
		httperror.InternalServerError(context, "Error collecting projects data on db", err)
		return
	}

	// Convert to ProjectsWithMembers and populate Members
	projectsWithMembers := make([]models.AdminProjectsWithMembers, len(projects))
	for i, project := range projects {
		projectsWithMembers[i].Projects = project

		members := make([]models.ProjectMembersWithUserData, 0)
		err = db.NewRaw("SELECT project_members.*, us.username, us.email FROM project_members JOIN users AS us ON us.id::uuid = project_members.user_id::uuid WHERE project_members.project_id = ? ORDER BY CASE WHEN project_members.role = 'Owner' THEN 1 WHEN project_members.role = 'Editor' THEN 2 ELSE 3 END", project.ID).
			Scan(context, &members)
		if err != nil {
			httperror.InternalServerError(context, "Error receiving project members from db", err)
			return
		}

		projectsWithMembers[i].Members = members
	}

	context.JSON(http.StatusOK, gin.H{"projects": projectsWithMembers})
}
