package models

import (
	"time"

	"github.com/google/uuid"
	"github.com/uptrace/bun"
)

type Executions struct {
	bun.BaseModel `bun:"table:executions"`

	ID         uuid.UUID `bun:",pk,type:uuid,default:gen_random_uuid()" json:"id"`
	FlowID     string    `bun:"flow_id,type:text,default:''" json:"flow_id"`
	RunnerID   string    `bun:"runner_id,type:text,default:''" json:"runner_id"`
	Status     string    `bun:"status,type:text,default:''" json:"status"`
	CreatedAt  time.Time `bun:"created_at,type:timestamptz,default:now()" json:"created_at"`
	ExecutedAt time.Time `bun:"executed_at,type:timestamptz" json:"executed_at"`
	FinishedAt time.Time `bun:"finished_at,type:timestamptz" json:"finished_at"`
}
