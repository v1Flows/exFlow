package admin_stats

import (
	"github.com/v1Flows/exFlow/services/backend/functions/httperror"
	"github.com/v1Flows/exFlow/services/backend/pkg/models"
	"sort"
	"strconv"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/uptrace/bun"
)

func UserRegistrationStats(interval string, context *gin.Context, db *bun.DB) []models.Stats {
	var stats []models.Stats
	err := db.NewSelect().
		TableExpr("(SELECT DATE(created_at) as date, COUNT(*) as value FROM users WHERE created_at >= NOW() - INTERVAL '"+interval+" days' GROUP BY DATE(created_at)) AS subquery").
		Scan(context, &stats)
	if err != nil {
		httperror.InternalServerError(context, "Error collecting user stats from db", err)
		return nil
	}

	// Create a map to store the execution stats by date
	statsMap := make(map[string]int)
	for _, stat := range stats {
		statsMap[stat.Key] = stat.Value
	}

	// Generate the execution stats for the last 7 days
	intervalInt, _ := strconv.Atoi(interval)
	currentDate := time.Now().UTC().AddDate(0, 0, -1*intervalInt) // Start from 'interval' days ago
	for i := 0; i < intervalInt; i++ {
		dateString := currentDate.Format("2006-01-02")
		if _, ok := statsMap[dateString]; !ok {
			stats = append(stats, models.Stats{Key: dateString, Value: 0})
		}
		currentDate = currentDate.AddDate(0, 0, 1) // Move to the next day
	}

	// Add the current date to the execution stats
	currentDateString := time.Now().UTC().Format("2006-01-02")
	if _, ok := statsMap[currentDateString]; !ok {
		stats = append(stats, models.Stats{Key: currentDateString, Value: 0})
	}

	// Sort the execution stats by date
	sort.Slice(stats, func(i, j int) bool {
		date1, _ := time.Parse("2006-01-02", stats[i].Key)
		date2, _ := time.Parse("2006-01-02", stats[j].Key)
		return date1.Before(date2)
	})

	return stats
}
