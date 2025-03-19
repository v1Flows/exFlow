package models

import (
	"time"

	"github.com/google/uuid"
	"github.com/uptrace/bun"
)

type Notifications struct {
	bun.BaseModel `bun:"table:notifications"`

	ID         uuid.UUID `bun:",pk,type:uuid,default:gen_random_uuid()" json:"id"`
	UserID     string    `bun:"user_id,type:text,notnull" json:"user_id"`
	Title      string    `bun:"title,type:text,notnull" json:"title"`
	Body       string    `bun:"body,type:text,default:''" json:"body"`
	IsRead     bool      `bun:"is_read,type:bool,default:false" json:"is_read"`
	IsArchived bool      `bun:"is_archived,type:bool,default:false" json:"is_archived"`
	Icon       string    `bun:"icon,type:text,default:''" json:"icon"`
	Color      string    `bun:"color,type:text,default:'primary'" json:"color"`
	Link       string    `bun:"link,type:text,default:''" json:"link"`
	LinkText   string    `bun:"link_text,type:text,default:''" json:"link_text"`
	CreatedAt  time.Time `bun:"created_at,type:timestamptz,default:now()" json:"created_at"`
}
