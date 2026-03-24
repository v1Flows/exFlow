package models

import (
	"fmt"
	"time"

	"github.com/google/uuid"
	"github.com/uptrace/bun"
)

// Valid step status values
const (
	StepStatusRunning            = "running"
	StepStatusPaused             = "paused"
	StepStatusInteractionWaiting = "interactionWaiting"
	StepStatusSuccess            = "success"
	StepStatusError              = "error"
	StepStatusWarning            = "warning"
	StepStatusCanceled           = "canceled"
)

var validStepStatuses = map[string]bool{
	StepStatusRunning:            true,
	StepStatusPaused:             true,
	StepStatusInteractionWaiting: true,
	StepStatusSuccess:            true,
	StepStatusError:              true,
	StepStatusWarning:            true,
	StepStatusCanceled:           true,
}

// ValidateStepStatus returns an error if the given status is not a recognized step status.
func ValidateStepStatus(status string) error {
	if status == "" || validStepStatuses[status] {
		return nil
	}
	return fmt.Errorf("invalid step status: %q", status)
}

type ExecutionSteps struct {
	bun.BaseModel `bun:"table:execution_steps"`

	ID                  uuid.UUID `bun:",pk,type:uuid,default:gen_random_uuid()" json:"id"`
	ExecutionID         string    `bun:"execution_id,type:text,notnull" json:"execution_id"`
	Action              Action    `bun:"action,type:jsonb,default:jsonb('{}')" json:"action"`
	Messages            []Message `bun:"messages,type:jsonb,default:jsonb('[]')" json:"messages"`
	RunnerID            string    `bun:"runner_id,type:text,default:''" json:"runner_id"`
	ParentID            string    `bun:"parent_id,type:text,default:''" json:"parent_id"`
	IsHidden            bool      `bun:"is_hidden,type:bool,default:false" json:"is_hidden"`
	Status              string    `bun:"status,type:text,default:''" json:"status"`
	Encrypted           bool      `bun:"encrypted,type:bool,default:false" json:"encrypted"`
	Interactive         bool      `bun:"interactive,type:bool,default:false" json:"interactive"`
	Interacted          bool      `bun:"interacted,type:bool,default:false" json:"interacted"`
	InteractionApproved bool      `bun:"interaction_approved,type:bool,default:false" json:"interaction_approved"`
	InteractionRejected bool      `bun:"interaction_rejected,type:bool,default:false" json:"interaction_rejected"`
	InteractedBy        string    `bun:"interacted_by,type:text,default:''" json:"interacted_by"`
	InteractedAt        time.Time `bun:"interacted_at,type:timestamptz" json:"interacted_at"`
	CanceledBy          string    `bun:"canceled_by,type:text,default:''" json:"canceled_by"`
	CanceledAt          time.Time `bun:"canceled_at,type:timestamptz" json:"canceled_at"`
	CreatedAt           time.Time `bun:"created_at,type:timestamptz,default:now()" json:"created_at"`
	StartedAt           time.Time `bun:"started_at,type:timestamptz" json:"started_at"`
	FinishedAt          time.Time `bun:"finished_at,type:timestamptz" json:"finished_at"`
	// Version is incremented on every update; used for optimistic concurrency control.
	Version int `bun:"version,type:int,default:0" json:"version"`
}

type Message struct {
	Title string `json:"title"`
	Lines []Line `json:"lines"`
}

type Line struct {
	Content   string    `json:"content"`
	Color     string    `json:"color"`
	Timestamp time.Time `json:"timestamp"`
}
