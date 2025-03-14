package models

import (
	"time"

	"github.com/google/uuid"
	"github.com/uptrace/bun"
)

type Audit struct {
	bun.BaseModel `bun:"table:audit"`

	ID        uuid.UUID `bun:",pk,type:uuid,default:gen_random_uuid()" json:"id"`
	ProjectID string    `bun:"project_id,type:text,notnull" json:"project_id"`
	UserID    string    `bun:"user_id,type:text,notnull" json:"user_id"`
	Operation string    `bun:"operation,type:text,notnull" json:"operation"`
	Details   string    `bun:"details,type:text,default:''" json:"details"`
	CreatedAt time.Time `bun:"created_at,type:timestamptz,default:now()" json:"created_at"`
}

type AuditWithUser struct {
	bun.BaseModel `bun:"table:audit"`

	ID        uuid.UUID `bun:",pk,type:uuid,default:gen_random_uuid()" json:"id"`
	ProjectID string    `bun:"project_id,type:text,notnull" json:"project_id"`
	UserID    string    `bun:"user_id,type:text,notnull" json:"user_id"`
	Operation string    `bun:"operation,type:text,notnull" json:"operation"`
	Details   string    `bun:"details,type:text,default:''" json:"details"`
	CreatedAt time.Time `bun:"created_at,type:timestamptz,default:now()" json:"created_at"`
	Username  string    `bun:"username,type:text" json:"username"`
	Email     string    `bun:"email,type:text" json:"email"`
	Role      string    `bun:"role,type:text" json:"role"`
}
