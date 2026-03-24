package telemetry

import (
	"github.com/prometheus/client_golang/prometheus"
	"github.com/prometheus/client_golang/prometheus/promauto"
)

var (
	FlowExecutionsTotal = promauto.NewCounterVec(
		prometheus.CounterOpts{
			Name: "flow_executions_total",
			Help: "Total number of flow executions triggered",
		},
		[]string{"status", "flow_id"},
	)
)
