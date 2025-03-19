package flows

import (
	"github.com/v1Flows/exFlow/services/backend/functions/httperror"
	functions_project "github.com/v1Flows/exFlow/services/backend/functions/project"
	"github.com/v1Flows/exFlow/services/backend/pkg/models"
	"errors"
	"net/http"

	"github.com/gin-gonic/gin"
	_ "github.com/lib/pq"
	log "github.com/sirupsen/logrus"
	"github.com/uptrace/bun"
)

func CreateFlow(context *gin.Context, db *bun.DB) {
	var flow models.Flows
	if err := context.ShouldBindJSON(&flow); err != nil {
		httperror.StatusBadRequest(context, "Error parsing incoming data", err)
		return
	}

	if flow.Name == "" {
		httperror.StatusBadRequest(context, "Name is required", errors.New("name is required"))
		return
	}

	_, err := db.NewInsert().Model(&flow).Exec(context)
	if err != nil {
		httperror.InternalServerError(context, "Error creating flow on db", err)
		return
	}

	err = functions_project.CreateAuditEntry(flow.ProjectID, "create", "Flow created: "+flow.Name, db, context)
	if err != nil {
		log.Error(err)
	}

	context.JSON(http.StatusCreated, gin.H{"result": "success"})
}
