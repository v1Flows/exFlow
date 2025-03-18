package executions

import (
	"net/http"
	"time"

	"github.com/v1Flows/exFlow/services/backend/functions/httperror"
	"github.com/v1Flows/exFlow/services/backend/pkg/models"

	"github.com/gin-gonic/gin"
	"github.com/uptrace/bun"
)

func StartExecution(context *gin.Context, db *bun.DB) {
	var execution models.Executions
	if err := context.ShouldBindJSON(&execution); err != nil {
		httperror.StatusBadRequest(context, "Error parsing incoming data", err)
		return
	}

	// check if flow_id is set
	if execution.FlowID == "" {
		httperror.StatusBadRequest(context, "Flow ID is required", nil)
		return
	}

	execution.CreatedAt = time.Now()
	execution.Status = "pending"
	_, err := db.NewInsert().Model(&execution).Exec(context)
	if err != nil {
		httperror.InternalServerError(context, "Error creating execution on db", err)
		return
	}

	context.JSON(http.StatusCreated, gin.H{"result": "success", "id": execution.ID})
}
