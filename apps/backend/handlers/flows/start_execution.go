package flows

import (
	"net/http"
	"time"

	"github.com/google/uuid"
	log "github.com/sirupsen/logrus"
	"github.com/JustLABv1/justflow/apps/backend/functions/auth"
	"github.com/JustLABv1/justflow/apps/backend/functions/encryption"
	"github.com/JustLABv1/justflow/apps/backend/functions/httperror"
	"github.com/JustLABv1/justflow/apps/backend/pkg/models"

	"github.com/gin-gonic/gin"
	"github.com/uptrace/bun"
)

func StartExecution(context *gin.Context, db *bun.DB) {
	flowID := context.Param("flowID")

	// check if flow with given ID exists
	var flow models.Flows
	err := db.NewSelect().Model(&flow).Where("id = ?", flowID).Scan(context)
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

	// check auth token type
	tokenType, err := auth.GetTypeFromToken(context.GetHeader("Authorization"))
	if err != nil {
		httperror.InternalServerError(context, "Error receiving token type", err)
		return
	}

	if tokenType == "project" {
		tokenType = "Project Token"
	}

	var execution models.Executions
	execution.ID = uuid.New()
	execution.CreatedAt = time.Now()
	execution.FlowID = flowID
	execution.Status = "pending"
	execution.TriggeredBy = tokenType
	_, err = db.NewInsert().Model(&execution).Exec(context)
	if err != nil {
		httperror.InternalServerError(context, "Error creating execution on db", err)
		return
	}

	// create execution step which tells that the execution is registerd and waiting for runner to pick it up
	step := models.ExecutionSteps{
		ExecutionID: execution.ID.String(),
		Action: models.Action{
			Name: "Pick Up",
			Icon: "hugeicons:rocket",
		},
		Messages: []models.Message{
			{
				Title: "Pick Up",
				Lines: []models.Line{
					{
						Content:   "Execution is registered and waiting for runner to pick it up",
						Timestamp: time.Now(),
					},
				},
			},
		},
		Status:    "running",
		CreatedAt: time.Now(),
		StartedAt: time.Now(),
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

	_, err = db.NewInsert().Model(&step).Exec(context)
	if err != nil {
		log.Error("Bot: Error adding error step", err)
	}

	context.JSON(http.StatusCreated, gin.H{"result": "success", "id": execution.ID})
}
