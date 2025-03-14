package models

type StatsExecutions struct {
	Key        string `json:"key"`
	Executions int    `json:"executions"`
}

type StatsExecutionsTotals struct {
	ExecutionCount int   `json:"total_executions"`
	ExecutionTrend Trend `json:"execution_trend"`
}

type Stats struct {
	Key   string `json:"key"`
	Value int    `json:"value"`
}

type PlanCountStats struct {
	Plan  string `json:"plan"`
	Count int    `json:"count"`
}

type RoleCountStats struct {
	Role  string `json:"role"`
	Count int    `json:"count"`
}

type Trend struct {
	Direction  string  `json:"direction"`
	Percentage float64 `json:"percentage"`
}
