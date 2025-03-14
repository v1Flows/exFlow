package admins

import (
	"net/http"

	"github.com/v1Flows/exFlow/services/backend/functions/admin_stats"
	"github.com/v1Flows/exFlow/services/backend/functions/httperror"

	"github.com/gin-gonic/gin"
	"github.com/uptrace/bun"
)

func GetStats(context *gin.Context, db *bun.DB) {
	interval := context.DefaultQuery("interval", "7")

	// Get the stats for the last 7 days
	startedExecutionStats := admin_stats.StartedExecutionsStats(interval, context, db)
	if startedExecutionStats == nil {
		httperror.InternalServerError(context, "Error collecting stats", nil)
		return
	}

	failedExecutionStats := admin_stats.FailedExecutionsStats(interval, context, db)
	if failedExecutionStats == nil {
		httperror.InternalServerError(context, "Error collecting stats", nil)
		return
	}

	incomingAlertStats := admin_stats.IncomingAlertsStats(interval, context, db)
	if incomingAlertStats == nil {
		httperror.InternalServerError(context, "Error collecting stats", nil)
		return
	}

	userRegistrationStats := admin_stats.UserRegistrationStats(interval, context, db)
	if userRegistrationStats == nil {
		httperror.InternalServerError(context, "Error collecting stats", nil)
		return
	}

	projectCreationStats := admin_stats.ProjectCreationStats(interval, context, db)
	if projectCreationStats == nil {
		httperror.InternalServerError(context, "Error collecting stats", nil)
		return
	}

	flowCreationStats := admin_stats.FlowCreationStats(interval, context, db)
	if flowCreationStats == nil {
		httperror.InternalServerError(context, "Error collecting stats", nil)
		return
	}

	usersPerPlanStats := admin_stats.UsersPerPlanStats(context, db)
	if usersPerPlanStats == nil {
		httperror.InternalServerError(context, "Error collecting stats", nil)
		return
	}

	usersPerRoleStats := admin_stats.UsersPerRoleStats(context, db)
	if usersPerRoleStats == nil {
		httperror.InternalServerError(context, "Error collecting stats", nil)
		return
	}

	// Return the stats
	context.JSON(http.StatusOK, gin.H{
		"started_execution_stats": startedExecutionStats,
		"failed_execution_stats":  failedExecutionStats,
		"incoming_alert_stats":    incomingAlertStats,
		"user_registration_stats": userRegistrationStats,
		"project_creation_stats":  projectCreationStats,
		"flow_creation_stats":     flowCreationStats,
		"users_per_plan_stats":    usersPerPlanStats,
		"users_per_role_stats":    usersPerRoleStats,
	})
}
