package models

import (
	"time"

	"github.com/google/uuid"
	"github.com/uptrace/bun"
)

type Runners struct {
	bun.BaseModel `bun:"table:runners"`

	ID                 uuid.UUID  `bun:",pk,type:uuid,default:gen_random_uuid()" json:"id"`
	Name               string     `bun:"name,type:text,notnull" json:"name"`
	Registered         bool       `bun:"registered,type:bool,default:false" json:"registered"`
	ProjectID          string     `bun:"project_id,type:text,default:''" json:"project_id"`
	Version            string     `bun:"version,type:text,default:''" json:"version"`
	Mode               string     `bun:"mode,type:text,default:''" json:"mode"`
	AutoRunner         bool       `bun:"auto_runner,type:bool,default:false" json:"auto_runner"`
	SharedRunner       bool       `bun:"shared_runner,type:bool,default:false" json:"shared_runner"`
	LastHeartbeat      time.Time  `bun:"last_heartbeat,type:timestamptz" json:"last_heartbeat"`
	ExecutingJob       bool       `bun:"executing_job,type:bool,default:false" json:"executing_job"`
	Disabled           bool       `bun:"disabled,type:bool,default:false" json:"disabled"`
	DisabledReason     string     `bun:"disabled_reason,type:text,default:''" json:"disabled_reason"`
	Plugins            []Plugin   `bun:"plugins,type:jsonb,default:jsonb('[]')" json:"plugins"`
	Actions            []Action   `bun:"actions,type:jsonb,default:jsonb('[]')" json:"actions"`
	Endpoints          []Endpoint `bun:"endpoints,type:jsonb,default:jsonb('[]')" json:"endpoints"`
	RegisteredAt       time.Time  `bun:"registered_at,type:timestamptz,default:now()" json:"registered_at"`
	ExecutedExecutions []string   `bun:"executed_executions,type:text[],default:'{}'" json:"executed_executions"`
	ApiURL             string     `bun:"api_url,type:text,default:''" json:"api_url"`
	ApiToken           string     `bun:"api_token,type:text,default:''" json:"api_token"`
}

type Endpoint struct {
	ID    string `json:"id"`
	Name  string `json:"name"`
	Path  string `json:"path"`
	Icon  string `json:"icon"`
	Color string `json:"color"`
}

type IncomingAutoRunners struct {
	Registered    bool       `json:"registered"`
	Version       string     `json:"version"`
	Mode          string     `json:"mode"`
	LastHeartbeat time.Time  `json:"last_heartbeat"`
	Plugins       []Plugin   `json:"plugins"`
	Actions       []Action   `json:"actions"`
	Endpoints     []Endpoint `json:"endpoints"`
	ApiURL        string     `json:"api_url"`
	ApiToken      string     `json:"api_token"`
}

type Plugin struct {
	Name     string   `json:"name"`
	Type     string   `json:"type"`
	Version  string   `json:"version"`
	Author   string   `json:"author"`
	Action   Action   `json:"action"`
	Endpoint Endpoint `json:"endpoint"`
}
