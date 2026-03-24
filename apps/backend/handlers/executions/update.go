package executions

import (
	"net/http"
	"time"

	"github.com/JustLABv1/justflow/apps/backend/functions/httperror"
	"github.com/JustLABv1/justflow/apps/backend/pkg/models"
	"github.com/JustLABv1/justflow/apps/backend/pkg/telemetry"

	"github.com/gin-gonic/gin"
	"github.com/uptrace/bun"
)

func Update(context *gin.Context, db *bun.DB) {
	executionID := context.Param("executionID")

	var execution models.Executions
	if err := context.ShouldBindJSON(&execution); err != nil {
		httperror.StatusBadRequest(context, "Error parsing incoming data", err)
		return
	}

	// Fetch existing execution to get FlowID and ExecutedAt for metrics
	var existingExec models.Executions
	err := db.NewSelect().Model(&existingExec).Column("flow_id", "executed_at").Where("id = ?", executionID).Scan(context)
	if err != nil {
		// Log error but continue with update? Or fail?
		// If we can't find it, the update will likely fail or update 0 rows anyway.
		// But let's proceed to the update to be safe with existing logic.
	}

	_, err = db.NewUpdate().Model(&execution).Where("id = ?", executionID).ExcludeColumn("scheduled_at", "last_heartbeat", "triggered_by").Exec(context)
	if err != nil {
		httperror.InternalServerError(context, "Error updating execution data on db", err)
		return
	}

	// Metrics
	if execution.Status == "success" || execution.Status == "failed" || execution.Status == "canceled" {
		flowID := execution.FlowID
		if flowID == "" {
			flowID = existingExec.FlowID
		}

		telemetry.ExecutionFinishedTotal.WithLabelValues(execution.Status, flowID).Inc()

		// Calculate duration
		var start, end time.Time
		if !execution.ExecutedAt.IsZero() {
			start = execution.ExecutedAt
		} else {
			start = existingExec.ExecutedAt
		}

		if !execution.FinishedAt.IsZero() {
			end = execution.FinishedAt
		}

		if !start.IsZero() && !end.IsZero() {
			duration := end.Sub(start).Seconds()
			telemetry.ExecutionDurationSeconds.WithLabelValues(execution.Status, flowID).Observe(duration)
		}
	}

	context.JSON(http.StatusOK, gin.H{"result": "success"})
}
