package executions

import (
	"net/http"
	"time"

	"github.com/JustLABv1/justflow/services/backend/functions/encryption"
	"github.com/JustLABv1/justflow/services/backend/functions/httperror"
	"github.com/JustLABv1/justflow/services/backend/pkg/models"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	log "github.com/sirupsen/logrus"
	"github.com/uptrace/bun"
)

func CreateStep(context *gin.Context, db *bun.DB) {
	var step models.ExecutionSteps
	if err := context.ShouldBindJSON(&step); err != nil {
		httperror.StatusBadRequest(context, "Error parsing incoming data", err)
		return
	}

	// get parent execution data
	var execution models.Executions
	err := db.NewSelect().Model(&execution).Column("flow_id").Where("id = ?", step.ExecutionID).Scan(context)
	if err != nil {
		httperror.InternalServerError(context, "Error fetching parent execution data", err)
		return
	}
	// get flow data
	var flow models.Flows
	err = db.NewSelect().Model(&flow).Where("id = ?", execution.FlowID).Scan(context)
	if err != nil {
		httperror.InternalServerError(context, "Error fetching flow data", err)
		return
	}
	// get project data
	var project models.Projects
	err = db.NewSelect().Model(&project).Where("id = ?", flow.ProjectID).Scan(context)
	if err != nil {
		httperror.InternalServerError(context, "Error collecting project data from db", err)
		return
	}

	// check for encryption
	if project.EncryptionEnabled && step.Messages != nil && len(step.Messages) > 0 {
		step.Messages, err = encryption.EncryptExecutionStepActionMessageWithProject(step.Messages, project.ID.String(), db)
		if err != nil {
			httperror.InternalServerError(context, "Error encrypting execution step action messages", err)
			return
		}

		step.Encrypted = true
	}

	step.ID = uuid.New()
	step.CreatedAt = time.Now()
	_, err = db.NewInsert().Model(&step).Exec(context)
	if err != nil {
		httperror.InternalServerError(context, "Error creating execution step on db", err)
		log.Error("Error creating execution step on db", err)
		return
	}

	context.JSON(http.StatusCreated, gin.H{"result": "success", "id": step.ID})
}
