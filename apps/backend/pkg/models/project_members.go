package models

import (
	"time"

	"github.com/google/uuid"
	"github.com/uptrace/bun"
)

type ProjectMembers struct {
	bun.BaseModel `bun:"table:project_members"`

	ID             uuid.UUID `bun:",pk,type:uuid,default:gen_random_uuid()" json:"id"`
	UserID         string    `bun:"user_id,type:text,notnull" json:"user_id"`
	ProjectID      string    `bun:"project_id,type:text,notnull" json:"project_id"`
	Role           string    `bun:"role,type:text,notnull" json:"role"`
	Disabled       bool      `bun:"disabled,type:bool,default:false" json:"disabled"`
	DisabledReason string    `bun:"disabled_reason,type:text,default:''" json:"disabled_reason"`
	InvitePending  bool      `bun:"invite_pending,type:bool,default:false" json:"invite_pending"`
	InvitedAt      time.Time `bun:"invited_at,type:timestamptz,default:now()" json:"invited_at"`
}

type ProjectMembersWithUserData struct {
	bun.BaseModel `bun:"table:project_members"`

	ID             uuid.UUID `bun:",pk,type:uuid,default:gen_random_uuid()" json:"id"`
	UserID         string    `bun:"user_id,type:text,notnull" json:"user_id"`
	ProjectID      string    `bun:"project_id,type:text,notnull" json:"project_id"`
	Role           string    `bun:"role,type:text,notnull" json:"role"`
	Disabled       bool      `bun:"disabled,type:bool,default:false" json:"disabled"`
	DisabledReason string    `bun:"disabled_reason,type:text,default:''" json:"disabled_reason"`
	InvitePending  bool      `bun:"invite_pending,type:bool,default:false" json:"invite_pending"`
	InvitedAt      time.Time `bun:"invited_at,type:timestamptz,default:now()" json:"invited_at"`
	Username       string    `bun:"username,type:text" json:"username"`
	Email          string    `bun:"email,type:text" json:"email"`
}
