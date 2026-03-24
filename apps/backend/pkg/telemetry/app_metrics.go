package telemetry

import (
	"context"
	"time"

	"github.com/JustLABv1/justflow/apps/backend/pkg/models"
	"github.com/prometheus/client_golang/prometheus"
	"github.com/prometheus/client_golang/prometheus/promauto"
	log "github.com/sirupsen/logrus"
	"github.com/uptrace/bun"
)

var (
	projectsTotal = promauto.NewGauge(prometheus.GaugeOpts{
		Name: "justflow_projects_total",
		Help: "Total number of projects",
	})

	flowsTotal = promauto.NewGauge(prometheus.GaugeOpts{
		Name: "justflow_flows_total",
		Help: "Total number of flows",
	})

	usersTotal = promauto.NewGauge(prometheus.GaugeOpts{
		Name: "justflow_users_total",
		Help: "Total number of users",
	})

	runnersTotal = promauto.NewGauge(prometheus.GaugeOpts{
		Name: "justflow_runners_total",
		Help: "Total number of runners",
	})

	runnersOnlineTotal = promauto.NewGauge(prometheus.GaugeOpts{
		Name: "justflow_runners_online_total",
		Help: "Total number of online runners (heartbeat < 1m)",
	})

	runnersExecutingTotal = promauto.NewGauge(prometheus.GaugeOpts{
		Name: "justflow_runners_executing_total",
		Help: "Total number of runners currently executing a job",
	})

	executionsCurrent = promauto.NewGaugeVec(prometheus.GaugeOpts{
		Name: "justflow_executions_current",
		Help: "Current number of executions by status",
	}, []string{"status"})

	alertsCurrent = promauto.NewGaugeVec(prometheus.GaugeOpts{
		Name: "justflow_alerts_current",
		Help: "Current number of alerts by status",
	}, []string{"status"})
)

// InitAppMetrics starts a background routine to update application metrics
func InitAppMetrics(db *bun.DB) {
	go func() {
		ticker := time.NewTicker(1 * time.Minute)
		defer ticker.Stop()

		// Update immediately on start
		updateMetrics(db)

		for range ticker.C {
			updateMetrics(db)
		}
	}()
}

func updateMetrics(db *bun.DB) {
	ctx := context.Background()

	// Projects
	count, err := db.NewSelect().Model((*models.Projects)(nil)).Count(ctx)
	if err == nil {
		projectsTotal.Set(float64(count))
	} else {
		log.Error("Failed to count projects for metrics: ", err)
	}

	// Flows
	count, err = db.NewSelect().Model((*models.Flows)(nil)).Count(ctx)
	if err == nil {
		flowsTotal.Set(float64(count))
	} else {
		log.Error("Failed to count flows for metrics: ", err)
	}

	// Users
	count, err = db.NewSelect().Model((*models.Users)(nil)).Count(ctx)
	if err == nil {
		usersTotal.Set(float64(count))
	} else {
		log.Error("Failed to count users for metrics: ", err)
	}

	// Runners
	var runners []models.Runners
	err = db.NewSelect().Model(&runners).Scan(ctx)
	if err == nil {
		runnersTotal.Set(float64(len(runners)))

		onlineCount := 0
		executingCount := 0
		threshold := time.Now().Add(-1 * time.Minute)

		for _, r := range runners {
			if r.LastHeartbeat.After(threshold) {
				onlineCount++
			}
			if r.ExecutingJob {
				executingCount++
			}
		}
		runnersOnlineTotal.Set(float64(onlineCount))
		runnersExecutingTotal.Set(float64(executingCount))
	} else {
		log.Error("Failed to fetch runners for metrics: ", err)
	}

	// Executions by status
	var executionStats []struct {
		Status string
		Count  int
	}
	err = db.NewSelect().
		Model((*models.Executions)(nil)).
		Column("status").
		ColumnExpr("count(*) as count").
		Group("status").
		Scan(ctx, &executionStats)

	if err == nil {
		// Reset all known statuses to 0 first to avoid stale data if a status count drops to 0
		// Ideally we would know all possible statuses, but for now we just set what we find.
		// A better approach for a GaugeVec is to track what we set and delete others,
		// or just accept that 0s might be missing if we don't know the set of all statuses.
		// For simplicity, we just set what we find.
		for _, stat := range executionStats {
			executionsCurrent.WithLabelValues(stat.Status).Set(float64(stat.Count))
		}
	} else {
		log.Error("Failed to count executions for metrics: ", err)
	}

	// Alerts by status
	var alertStats []struct {
		Status string
		Count  int
	}
	err = db.NewSelect().
		Model((*models.Alerts)(nil)).
		Column("status").
		ColumnExpr("count(*) as count").
		Group("status").
		Scan(ctx, &alertStats)

	if err == nil {
		for _, stat := range alertStats {
			alertsCurrent.WithLabelValues(stat.Status).Set(float64(stat.Count))
		}
	} else {
		log.Error("Failed to count alerts for metrics: ", err)
	}
}
