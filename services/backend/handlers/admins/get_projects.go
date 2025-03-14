package admins

import (
	"github.com/v1Flows/exFlow/services/backend/functions/httperror"
	"github.com/v1Flows/exFlow/services/backend/pkg/models"
	"net/http"

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

	members := make([]models.ProjectMembersWithUserData, 0)
	err = db.NewRaw("SELECT project_members.*, us.username, us.email FROM project_members JOIN users AS us ON us.id::uuid = project_members.user_id::uuid").Scan(context, &members)
	if err != nil {
		httperror.InternalServerError(context, "Error collecting projects member data on db", err)
		return
	}

	context.JSON(http.StatusOK, gin.H{"projects": projects, "members": members})
}
