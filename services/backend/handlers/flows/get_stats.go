package flows

import (
	"net/http"

	"github.com/v1Flows/exFlow/services/backend/functions/flow_stats"
	"github.com/v1Flows/exFlow/services/backend/functions/httperror"

	"github.com/gin-gonic/gin"
	"github.com/uptrace/bun"
)

func GetStats(context *gin.Context, db *bun.DB) {
	flowID := context.Param("flowID")
	interval := context.DefaultQuery("interval", "24-hours")

	alertExecutionsStats := flow_stats.AlertExecutionsStats(interval, flowID, context, db)
	if alertExecutionsStats == nil {
		httperror.InternalServerError(context, "Error collecting stats", nil)
		return
	}

	alertExectuionsTrends, err := flow_stats.AlertExecutionsTrends(interval, flowID, context, db)
	if err != nil {
		httperror.InternalServerError(context, "Error collecting trends", nil)
		return
	}

	// Return the stats
	context.JSON(http.StatusOK, gin.H{
		"alerts_executions_stats":  alertExecutionsStats,
		"alerts_executions_trends": alertExectuionsTrends,
	})
}
