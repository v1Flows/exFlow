package users

import (
	"net/http"
	"time"

	"github.com/JustLABv1/justflow/apps/backend/functions/auth"
	"github.com/JustLABv1/justflow/apps/backend/functions/httperror"
	"github.com/JustLABv1/justflow/apps/backend/pkg/models"

	"github.com/gin-gonic/gin"
	"github.com/uptrace/bun"
)

func GetUserStats(context *gin.Context, db *bun.DB) {
	userID, err := auth.GetUserIDFromToken(context.GetHeader("Authorization"))
	if err != nil {
		httperror.InternalServerError(context, "Error receiving userID from token", err)
		return
	}

	var projects []models.Projects
	projectCount, err := db.NewSelect().Model(&projects).Where("id::uuid IN (SELECT project_id::uuid FROM project_members WHERE user_id = ? AND invite_pending = false)", userID).Count(context)
	if err != nil {
		httperror.InternalServerError(context, "Error collecting amount of projects from db", err)
		return
	}

	var flows []models.Flows
	flowCount, err := db.NewSelect().Model(&flows).Where("project_id::text IN (SELECT project_id::text FROM project_members WHERE user_id = ? AND invite_pending = false)", userID).ScanAndCount(context)
	if err != nil {
		httperror.InternalServerError(context, "Error collecting amount of flows from db", err)
		return
	}

	var runners []models.Runners
	runnerCount, err := db.NewSelect().Model(&runners).Where("project_id::text IN (SELECT project_id::text FROM project_members WHERE user_id = ? AND invite_pending = false)", userID).Count(context)
	if err != nil {
		httperror.InternalServerError(context, "Error collecting amount of runners from db", err)
		return
	}

	// executions
	/// put flow ids in an array
	flowsArray := make([]string, 0)
	for _, flow := range flows {
		flowsArray = append(flowsArray, flow.ID.String())
	}

	type Stats struct {
		Weekday         string `json:"weekday"`
		TotalExecutions int    `json:"total_executions"`
		Success         int    `json:"success"`
		Error           int    `json:"error"`
		Pending         int    `json:"pending"`
		Running         int    `json:"running"`
		Canceled        int    `json:"canceled"`
		Scheduled       int    `json:"scheduled"`
		NoPatternMatch  int    `json:"noPatternMatch"`
		Recovered       int    `json:"recovered"`
	}

	type AlertStats struct {
		Weekday     string `json:"weekday"`
		TotalAlerts int    `json:"total_alerts"`
		Firing      int    `json:"firing"`
		Resolved    int    `json:"resolved"`
	}

	type RawExecutionStats struct {
		Date   string `json:"date"`
		Status string `json:"status"`
		Value  int    `json:"value"`
	}

	var rawExecutionStats []RawExecutionStats
	err = db.NewSelect().
		TableExpr("(SELECT DATE(created_at) as date, status, COUNT(*) as value FROM executions WHERE flow_id IN (?) AND created_at >= NOW() - INTERVAL '7 days' GROUP BY DATE(created_at), status) AS subquery", bun.In(flowsArray)).
		Scan(context, &rawExecutionStats)
	if err != nil {
		httperror.InternalServerError(context, "Error collecting execution stats from db", err)
		return
	}

	// Create a map to store the execution stats by weekday and status
	statsMap := make(map[string]map[string]int)
	totalStatsMap := make(map[string]int)
	for _, stat := range rawExecutionStats {
		date, _ := time.Parse("2006-01-02", stat.Date)
		weekday := date.Weekday().String()[:3]

		if statsMap[weekday] == nil {
			statsMap[weekday] = make(map[string]int)
		}

		statsMap[weekday][stat.Status] += stat.Value
		totalStatsMap[weekday] += stat.Value
	}

	// Generate the execution stats for each weekday of the week
	var executionStats []Stats
	for i := 6; i >= 0; i-- { // Look from the current weekday in the past
		weekday := time.Now().AddDate(0, 0, -i).Weekday().String()[:3]

		executionStats = append(executionStats, Stats{
			Weekday:         weekday,
			TotalExecutions: totalStatsMap[weekday],
			Success:         statsMap[weekday]["success"],
			Error:           statsMap[weekday]["error"],
			Pending:         statsMap[weekday]["pending"],
			Running:         statsMap[weekday]["running"],
			Canceled:        statsMap[weekday]["canceled"],
			Scheduled:       statsMap[weekday]["scheduled"],
			NoPatternMatch:  statsMap[weekday]["noPatternMatch"],
			Recovered:       statsMap[weekday]["recovered"],
		})
	}

	// alerts - similar logic as executions
	type RawAlertStats struct {
		Date   string `json:"date"`
		Status string `json:"status"`
		Value  int    `json:"value"`
	}

	var rawAlertStats []RawAlertStats
	err = db.NewSelect().
		TableExpr("(SELECT DATE(created_at) as date, status, COUNT(*) as value FROM alerts WHERE flow_id IN (?) AND created_at >= NOW() - INTERVAL '7 days' GROUP BY DATE(created_at), status) AS subquery", bun.In(flowsArray)).
		Scan(context, &rawAlertStats)
	if err != nil {
		httperror.InternalServerError(context, "Error collecting alert stats from db", err)
		return
	}

	// Create a map to store the alert stats by weekday and status
	alertStatsMap := make(map[string]map[string]int)
	totalAlertStatsMap := make(map[string]int)
	for _, stat := range rawAlertStats {
		date, _ := time.Parse("2006-01-02", stat.Date)
		weekday := date.Weekday().String()[:3]

		if alertStatsMap[weekday] == nil {
			alertStatsMap[weekday] = make(map[string]int)
		}

		alertStatsMap[weekday][stat.Status] += stat.Value
		totalAlertStatsMap[weekday] += stat.Value
	}

	// Generate the alert stats for each weekday of the week
	var alertStats []AlertStats
	for i := 6; i >= 0; i-- { // Look from the current weekday in the past
		weekday := time.Now().AddDate(0, 0, -i).Weekday().String()[:3]

		alertStats = append(alertStats, AlertStats{
			Weekday:     weekday,
			TotalAlerts: totalAlertStatsMap[weekday],
			Firing:      alertStatsMap[weekday]["firing"],
			Resolved:    alertStatsMap[weekday]["resolved"],
		})
	}

	alertCount := 0
	for _, alert := range alertStats {
		alertCount += alert.TotalAlerts
	}

	executionCount := 0
	for _, execution := range executionStats {
		executionCount += execution.TotalExecutions
	}

	context.JSON(http.StatusOK, gin.H{"result": "success", "stats": gin.H{
		"total_projects":   projectCount,
		"total_flows":      flowCount,
		"total_runners":    runnerCount,
		"total_executions": executionCount,
		"total_alerts":     alertCount,
		"executions":       executionStats,
		"alerts":           alertStats,
	}})
}
