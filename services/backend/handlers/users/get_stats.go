package users

import (
	"fmt"
	"net/http"
	"strconv"
	"time"

	"github.com/v1Flows/exFlow/services/backend/functions/auth"
	"github.com/v1Flows/exFlow/services/backend/functions/httperror"
	"github.com/v1Flows/exFlow/services/backend/pkg/models"

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
		Date      string `json:"date"`
		Weekday   string `json:"weekday"`
		Value     int    `json:"value"`
		IsCurrent bool   `json:"is_current"`
	}

	var executionStats []Stats
	err = db.NewSelect().
		TableExpr("(SELECT DATE(created_at) as date, COUNT(*) as value FROM executions WHERE flow_id IN (?) AND created_at >= NOW() - INTERVAL '7 days' GROUP BY DATE(created_at)) AS subquery", bun.In(flowsArray)).
		Scan(context, &executionStats)
	if err != nil {
		httperror.InternalServerError(context, "Error collecting execution stats from db", err)
		return
	}

	// Create a map to store the execution stats by weekday of the week
	statsMap := make(map[string]int)
	for _, stat := range executionStats {
		date, _ := time.Parse("2006-01-02", stat.Date)
		weekday := date.Weekday().String()[:2]
		statsMap[weekday] += stat.Value
	}

	// Generate the execution stats for each weekday of the week
	executionStats = make([]Stats, 0)
	for i := 6; i >= 0; i-- { // Look from the current weekday in the past
		weekday := time.Now().AddDate(0, 0, -i).Weekday().String()[:2]
		isCurrent := i == 0
		executionStats = append(executionStats, Stats{Weekday: weekday, Value: statsMap[weekday], IsCurrent: isCurrent})
	}

	// Determine the trend for executions
	executionTrend := "neutral"
	executionTrendPercentage := 0.0
	if len(executionStats) > 1 {
		previousValue := executionStats[len(executionStats)-2].Value
		currentValue := executionStats[len(executionStats)-1].Value
		if previousValue != 0 {
			if currentValue > previousValue {
				executionTrend = "positive"
				executionTrendPercentage = (float64(currentValue-previousValue) / float64(previousValue)) * 100
			} else if currentValue < previousValue {
				executionTrend = "negative"
				executionTrendPercentage = (float64(previousValue-currentValue) / float64(previousValue)) * 100
			}
		} else if currentValue > 0 {
			executionTrend = "positive"
			executionTrendPercentage = float64(currentValue) * 100 // Reflect significant increase
		}
		executionTrendPercentage, _ = strconv.ParseFloat(fmt.Sprintf("%.2f", executionTrendPercentage), 64)
	}

	executionCount := 0
	for _, execution := range executionStats {
		executionCount += execution.Value
	}

	context.JSON(http.StatusOK, gin.H{"result": "success", "stats": gin.H{
		"total_projects":             projectCount,
		"total_flows":                flowCount,
		"total_runners":              runnerCount,
		"total_executions":           executionCount,
		"executions":                 executionStats,
		"execution_trend":            executionTrend,
		"execution_trend_percentage": executionTrendPercentage,
	}})
}
