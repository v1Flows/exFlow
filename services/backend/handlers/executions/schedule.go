package executions

import (
	"net/http"
	"time"

	log "github.com/sirupsen/logrus"
	"github.com/v1Flows/exFlow/services/backend/functions/encryption"
	"github.com/v1Flows/exFlow/services/backend/functions/httperror"
	"github.com/v1Flows/exFlow/services/backend/pkg/models"
	shared_models "github.com/v1Flows/shared-library/pkg/models"

	"github.com/gin-gonic/gin"
	"github.com/uptrace/bun"
)

func ScheduleExecution(context *gin.Context, db *bun.DB) {
	var execution models.Executions
	if err := context.ShouldBindJSON(&execution); err != nil {
		httperror.StatusBadRequest(context, "Error parsing incoming data", err)
		return
	}

	// check if flow_id is set
	if execution.FlowID == "" {
		httperror.StatusBadRequest(context, "flow_id is required", nil)
		return
	}

	// check if schedule is set
	if execution.ScheduledAt.IsZero() {
		httperror.StatusBadRequest(context, "scheduled_at is required", nil)
		return
	}

	execution.CreatedAt = time.Now()
	execution.Status = "scheduled"
	_, err := db.NewInsert().Model(&execution).Exec(context)
	if err != nil {
		httperror.InternalServerError(context, "Error creating execution on db", err)
		return
	}

	// create execution step which tells that the execution is registerd and waiting for runner to pick it up
	step := shared_models.ExecutionSteps{
		ExecutionID: execution.ID.String(),
		Action: shared_models.Action{
			Name: "Pick Up",
			Icon: "hugeicons:rocket",
		},
		Messages: []shared_models.Message{
			{
				Title: "Pick Up",
				Lines: []shared_models.Line{
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

	// get flow data
	var flow models.Flows
	err = db.NewSelect().Model(&flow).Where("id = ?", execution.FlowID).Scan(context)
	if err != nil {
		httperror.InternalServerError(context, "Error fetching flow data", err)
		return
	}

	// check for encryption
	if flow.EncryptExecutions && step.Messages != nil && len(step.Messages) > 0 {
		step.Messages, err = encryption.EncryptExecutionStepActionMessage(step.Messages)
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
