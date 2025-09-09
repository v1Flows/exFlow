package models

import (
	"time"

	"github.com/google/uuid"
	"github.com/uptrace/bun"
)

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
