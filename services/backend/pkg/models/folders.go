package models

import (
	"time"

	"github.com/google/uuid"
	"github.com/uptrace/bun"
)

type Folders struct {
	bun.BaseModel `bun:"table:folders"`

	ID          uuid.UUID `bun:",pk,type:uuid,default:gen_random_uuid()" json:"id"`
	Name        string    `bun:"name,type:text,notnull" json:"name"`
	Description string    `bun:"description,type:text,default:''" json:"description"`
	ParentID    string    `bun:"parent_id,type:text,default:''" json:"parent_id"`
	ProjectID   string    `bun:"project_id,type:text,default:''" json:"project_id"`
	CreatedAt   time.Time `bun:"created_at,type:timestamptz,default:now()" json:"created_at"`
}
