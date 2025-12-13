package telemetry

import (
	"github.com/prometheus/client_golang/prometheus"
	"github.com/prometheus/client_golang/prometheus/promauto"
	"github.com/uptrace/bun"
)

// RegisterDBMetrics registers database metrics
func RegisterDBMetrics(db *bun.DB) {
	promauto.NewGaugeFunc(
		prometheus.GaugeOpts{
			Name: "db_open_connections",
			Help: "Number of open connections to the database",
		},
		func() float64 {
			return float64(db.Stats().OpenConnections)
		},
	)

	promauto.NewGaugeFunc(
		prometheus.GaugeOpts{
			Name: "db_in_use_connections",
			Help: "Number of connections currently in use",
		},
		func() float64 {
			return float64(db.Stats().InUse)
		},
	)

	promauto.NewGaugeFunc(
		prometheus.GaugeOpts{
			Name: "db_idle_connections",
			Help: "Number of idle connections",
		},
		func() float64 {
			return float64(db.Stats().Idle)
		},
	)

	promauto.NewGaugeFunc(
		prometheus.GaugeOpts{
			Name: "db_wait_count",
			Help: "Total number of connections waited for",
		},
		func() float64 {
			return float64(db.Stats().WaitCount)
		},
	)

	promauto.NewGaugeFunc(
		prometheus.GaugeOpts{
			Name: "db_wait_duration_seconds",
			Help: "Total time blocked waiting for a new connection",
		},
		func() float64 {
			return db.Stats().WaitDuration.Seconds()
		},
	)
}
