package models

import (
	"encoding/json"
	"time"

	"github.com/google/uuid"
	"github.com/uptrace/bun"
)

type Alerts struct {
	bun.BaseModel `bun:"table:alerts"`

	ID          uuid.UUID       `bun:",pk,type:uuid,default:gen_random_uuid()" json:"id"`
	Name        string          `bun:"name,type:text,default:''" json:"name"`
	Status      string          `bun:"status,type:text,default:''" json:"status"`
	Payload     json.RawMessage `bun:"payload,type:jsonb,default:jsonb('[]')" json:"payload"`
	FlowID      string          `bun:"flow_id,type:text,default:''" json:"flow_id"`
	ExecutionID string          `bun:"execution_id,type:text,default:''" json:"execution_id"`
	RunnerID    string          `bun:"runner_id,type:text,default:''" json:"runner_id"`
	ParentID    string          `bun:"parent_id,type:text,default:''" json:"parent_id"`
	Plugin      string          `bun:"plugin,type:text,default:''" json:"plugin"`
	CreatedAt   time.Time       `bun:"created_at,type:timestamptz,default:now()" json:"created_at"`
	Encrypted   bool            `bun:"encrypted,type:bool,default:false" json:"encrypted"`
	UpdatedAt   time.Time       `bun:"updated_at,type:timestamptz" json:"updated_at"`
	ResolvedAt  time.Time       `bun:"resolved_at,type:timestamptz" json:"resolved_at"`
	GroupKey    string          `bun:"group_key,type:text,default:''" json:"group_key"`
	SubAlerts   []SubAlerts     `bun:"sub_alerts,type:jsonb,default:jsonb('[]')" json:"sub_alerts"`
	Note        string          `bun:"note,type:text,default:''" json:"note"`
}

type AlertEndpoints struct {
	ID       string `json:"id"`
	Name     string `json:"name"`
	Endpoint string `json:"endpoint"`
	Icon     string `json:"icon"`
	Color    string `json:"color"`
}

type SubAlerts struct {
	ID         string          `json:"id"`
	Name       string          `json:"name"`
	Status     string          `json:"status"`
	Labels     json.RawMessage `json:"labels"`
	StartedAt  time.Time       `json:"started_at"`
	ResolvedAt time.Time       `json:"resolved_at"`
}

type IncomingGroupedAlertsRequest struct {
	FlowID                string `json:"flow_id"`
	GroupAlertsIdentifier string `json:"group_alerts_identifier"`
}
