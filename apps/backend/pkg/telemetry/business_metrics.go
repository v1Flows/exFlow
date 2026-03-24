package telemetry

import (
	"github.com/prometheus/client_golang/prometheus"
	"github.com/prometheus/client_golang/prometheus/promauto"
)

var (
	// Auth metrics
	UserLoginTotal = promauto.NewCounter(prometheus.CounterOpts{
		Name: "justflow_user_login_total",
		Help: "Total number of user logins (JWT generation)",
	})

	// Execution metrics
	ExecutionFinishedTotal = promauto.NewCounterVec(prometheus.CounterOpts{
		Name: "justflow_execution_finished_total",
		Help: "Total number of finished executions",
	}, []string{"status", "flow_id"})

	ExecutionDurationSeconds = promauto.NewHistogramVec(prometheus.HistogramOpts{
		Name:    "justflow_execution_duration_seconds",
		Help:    "Duration of flow executions in seconds",
		Buckets: prometheus.ExponentialBuckets(1, 2, 10), // 1s, 2s, 4s, ... 512s
	}, []string{"status", "flow_id"})

	// Background check metrics
	BackgroundCheckDurationSeconds = promauto.NewHistogramVec(prometheus.HistogramOpts{
		Name:    "justflow_background_check_duration_seconds",
		Help:    "Duration of background checks in seconds",
		Buckets: prometheus.DefBuckets,
	}, []string{"check_name"})
)
