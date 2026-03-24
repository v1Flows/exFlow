package models

import (
	"time"

	"github.com/google/uuid"
	"github.com/uptrace/bun"
)

type Tokens struct {
	bun.BaseModel `bun:"table:tokens"`

	ID             uuid.UUID `bun:",pk,type:uuid,default:gen_random_uuid()" json:"id"`
	ProjectID      string    `bun:"project_id,type:text,default:''" json:"project_id"`
	Key            string    `bun:"key,type:text,notnull" json:"key"`
	Description    string    `bun:"description,type:text,default:''" json:"description"`
	Type           string    `bun:"type,type:text,notnull" json:"type"`
	Disabled       bool      `bun:"disabled,type:bool,default:false" json:"disabled"`
	DisabledReason string    `bun:"disabled_reason,type:text,default:''" json:"disabled_reason"`
	CreatedAt      time.Time `bun:"created_at,type:timestamptz,default:now()" json:"created_at"`
	ExpiresAt      time.Time `bun:"expires_at,type:timestamptz" json:"expires_at"`
	UserID         string    `bun:"user_id,type:text,default:''" json:"user_id"`
}

type IncExpireTokenRequest struct {
	ExpiresIn   int    `json:"expires_in"`
	Description string `json:"description"`
}
