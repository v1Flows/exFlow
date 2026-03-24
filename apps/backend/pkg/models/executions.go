package models

import (
	"fmt"
	"time"

	"github.com/google/uuid"
	"github.com/uptrace/bun"
)

// Valid execution status values
const (
	ExecutionStatusPending        = "pending"
	ExecutionStatusRunning        = "running"
	ExecutionStatusPaused         = "paused"
	ExecutionStatusScheduled      = "scheduled"
	ExecutionStatusSuccess        = "success"
	ExecutionStatusError          = "error"
	ExecutionStatusCanceled       = "canceled"
	ExecutionStatusNoPatternMatch = "noPatternMatch"
	ExecutionStatusRecovered      = "recovered"
)

var validExecutionStatuses = map[string]bool{
	ExecutionStatusPending:        true,
	ExecutionStatusRunning:        true,
	ExecutionStatusPaused:         true,
	ExecutionStatusScheduled:      true,
	ExecutionStatusSuccess:        true,
	ExecutionStatusError:          true,
	ExecutionStatusCanceled:       true,
	ExecutionStatusNoPatternMatch: true,
	ExecutionStatusRecovered:      true,
}

// ValidateExecutionStatus returns an error if the given status is not a recognized execution status.
func ValidateExecutionStatus(status string) error {
	if status == "" || validExecutionStatuses[status] {
		return nil
	}
	return fmt.Errorf("invalid execution status: %q", status)
}

type Executions struct {
	bun.BaseModel `bun:"table:executions"`

	ID            uuid.UUID `bun:",pk,type:uuid,default:gen_random_uuid()" json:"id"`
	FlowID        string    `bun:"flow_id,type:text,default:''" json:"flow_id"`
	RunnerID      string    `bun:"runner_id,type:text,default:''" json:"runner_id"`
	Status        string    `bun:"status,type:text,default:''" json:"status"`
	CreatedAt     time.Time `bun:"created_at,type:timestamptz,default:now()" json:"created_at"`
	ExecutedAt    time.Time `bun:"executed_at,type:timestamptz" json:"executed_at"`
	FinishedAt    time.Time `bun:"finished_at,type:timestamptz" json:"finished_at"`
	LastHeartbeat time.Time `bun:"last_heartbeat,type:timestamptz" json:"last_heartbeat"`
	ScheduledAt   time.Time `bun:"scheduled_at,type:timestamptz" json:"scheduled_at"`
	TriggeredBy   string    `bun:"triggered_by,type:text,default:'user'" json:"triggered_by"`
	AlertID       string    `bun:"alert_id,type:text,default:''" json:"alert_id"`
}

type ExecutionWithSteps struct {
	Executions
	Steps []ExecutionSteps `json:"steps"`
}
