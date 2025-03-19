package models

import (
	"time"

	"github.com/google/uuid"
	"github.com/uptrace/bun"
)

type Projects struct {
	bun.BaseModel `bun:"table:projects"`

	ID                  uuid.UUID `bun:",pk,type:uuid,default:gen_random_uuid()" json:"id"`
	Name                string    `bun:"name,type:text,notnull" json:"name"`
	Description         string    `bun:"description,type:text,default:''" json:"description"`
	SharedRunners       bool      `bun:"shared_runners,type:bool,default:false" json:"shared_runners"`
	Color               string    `bun:"color,type:text,default:''" json:"color"`
	Icon                string    `bun:"icon,type:text,default:''" json:"icon"`
	Disabled            bool      `bun:"disabled,type:bool,default:false" json:"disabled"`
	DisabledReason      string    `bun:"disabled_reason,type:text,default:''" json:"disabled_reason"`
	CreatedAt           time.Time `bun:"created_at,type:timestamptz,default:now()" json:"created_at"`
	EnableAutoRunners   bool      `bun:"enable_auto_runners,type:bool,default:false" json:"enable_auto_runners"`
	DisableRunnerJoin   bool      `bun:"disable_runner_join,type:bool,default:false" json:"disable_runner_join"`
	RunnerAutoJoinToken string    `bun:"runner_auto_join_token,type:text,notnull" json:"runner_auto_join_token"`
}
