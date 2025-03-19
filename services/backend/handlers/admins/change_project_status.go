package admins

import (
	"github.com/v1Flows/exFlow/services/backend/functions/httperror"
	functions_project "github.com/v1Flows/exFlow/services/backend/functions/project"
	"github.com/v1Flows/exFlow/services/backend/pkg/models"
	"net/http"

	"github.com/gin-gonic/gin"
	log "github.com/sirupsen/logrus"
	"github.com/uptrace/bun"
)

func ChangeProjectStatus(context *gin.Context, db *bun.DB) {
	projectID := context.Param("projectID")

	var project models.Projects
	if err := context.ShouldBindJSON(&project); err != nil {
		httperror.StatusBadRequest(context, "Error parsing incoming data", err)
		return
	}

	_, err := db.NewUpdate().Model(&project).Column("disabled", "disabled_reason").Where("id = ?", projectID).Exec(context)
	if err != nil {
		httperror.InternalServerError(context, "Error updating project on db", err)
		return
	}

	// Audit
	if project.Disabled {
		err = functions_project.CreateAuditEntry(projectID, "update", "Project disabled: "+project.DisabledReason, db, context)
		if err != nil {
			log.Error(err)
		}
	} else {
		err = functions_project.CreateAuditEntry(projectID, "update", "Project enabled", db, context)
		if err != nil {
			log.Error(err)
		}
	}

	context.JSON(http.StatusOK, gin.H{"result": "success"})
}
