package models

import (
	"time"

	"github.com/google/uuid"
	"github.com/uptrace/bun"
)

// SelfServicePage is a curated page that exposes one or more flows to end-users.
// Editors and admins create pages; any project member can view and trigger them.
type SelfServicePage struct {
	bun.BaseModel `bun:"table:self_service_pages"`

	ID          uuid.UUID  `bun:",pk,type:uuid,default:gen_random_uuid()" json:"id"`
	Name        string     `bun:"name,type:text,notnull" json:"name"`
	Description string     `bun:"description,type:text,default:''" json:"description"`
	Slug        string     `bun:"slug,type:text,notnull" json:"slug"`
	ProjectID   string     `bun:"project_id,type:text,notnull" json:"project_id"`
	CreatedBy   string     `bun:"created_by,type:text,notnull" json:"created_by"`
	Icon        string     `bun:"icon,type:text,default:''" json:"icon"`
	Color       string     `bun:"color,type:text,default:''" json:"color"`
	Enabled     bool       `bun:"enabled,type:bool,default:true" json:"enabled"`
	PageFlows   []PageFlow `bun:"type:jsonb,default:jsonb('[]')" json:"page_flows"`
	CreatedAt   time.Time  `bun:"created_at,type:timestamptz,default:now()" json:"created_at"`
	UpdatedAt   time.Time  `bun:"updated_at,type:timestamptz" json:"updated_at"`
}

// PageFlow configures how a specific flow appears on the self-service page.
type PageFlow struct {
	FlowID              string          `json:"flow_id"`
	Order               int             `json:"order"`
	CustomLabel         string          `json:"custom_label"`
	CustomDescription   string          `json:"custom_description"`
	ExecutionVisibility string          `json:"execution_visibility"` // simplified | detailed | full
	InputOverrides      []InputOverride `json:"input_overrides"`
}

// InputOverride allows page editors to customise how a flow's InputParam appears on the page.
type InputOverride struct {
	InputParamID      string `json:"input_param_id"`
	CustomLabel       string `json:"custom_label"`
	CustomDescription string `json:"custom_description"`
	DefaultValue      string `json:"default_value"`
	Hidden            bool   `json:"hidden"`
}
