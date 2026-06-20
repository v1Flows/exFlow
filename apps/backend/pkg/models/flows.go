package models

import (
	"time"

	"github.com/google/uuid"
	"github.com/uptrace/bun"
)

type Flows struct {
	bun.BaseModel `bun:"table:flows"`

	ID                     uuid.UUID         `bun:",pk,type:uuid,default:gen_random_uuid()" json:"id"`
	Name                   string            `bun:"name,type:text,notnull" json:"name"`
	Description            string            `bun:"description,type:text,default:''" json:"description"`
	Type                   string            `bun:"type,type:text,default:'default'" json:"type"`
	ProjectID              string            `bun:"project_id,type:text,notnull" json:"project_id"`
	RunnerID               string            `bun:"runner_id,type:text,default:''" json:"runner_id"`
	ExecParallel           bool              `bun:"exec_parallel,type:bool,default:false" json:"exec_parallel"`
	UseDag                 bool              `bun:"use_dag,type:bool,default:false" json:"use_dag"`
	Actions                []Action          `bun:"type:jsonb,default:jsonb('[]')" json:"actions"`
	Maintenance            bool              `bun:"maintenance,type:bool,default:false" json:"maintenance"`
	MaintenanceMessage     string            `bun:"maintenance_message,type:text,default:''" json:"maintenance_message"`
	Disabled               bool              `bun:"disabled,type:bool,default:false" json:"disabled"`
	DisabledReason         string            `bun:"disabled_reason,type:text,default:''" json:"disabled_reason"`
	CreatedAt              time.Time         `bun:"created_at,type:timestamptz,default:now()" json:"created_at"`
	UpdatedAt              time.Time         `bun:"updated_at,type:timestamptz" json:"updated_at"`
	FailurePipelines       []FailurePipeline `bun:"type:jsonb,default:jsonb('[]')" json:"failure_pipelines"`
	FailurePipelineID      string            `bun:"failure_pipeline_id,type:text,default:''" json:"failure_pipeline_id"`
	FolderID               string            `bun:"folder_id,type:text,default:''" json:"folder_id"`
	ScheduleEveryValue     int               `bun:"schedule_every_value,type:integer,default:0" json:"schedule_every_value"`
	ScheduleEveryUnit      string            `bun:"schedule_every_unit,type:text,default:''" json:"schedule_every_unit"`
	Patterns               []Pattern         `bun:"type:jsonb,default:jsonb('[]')" json:"patterns"`
	GroupAlerts            bool              `bun:"group_alerts,type:bool,default:true" json:"group_alerts"`
	GroupAlertsIdentifier  string            `bun:"group_alerts_identifier,type:text,default:''" json:"group_alerts_identifier"`
	AlertThreshold         int               `bun:"alert_threshold,type:int,default:0" json:"alert_threshold"`
	AlwaysCleanupWorkspace bool              `bun:"always_cleanup_workspace,type:bool,default:false" json:"always_cleanup_workspace"`
	InputParams            []InputParam      `bun:"type:jsonb,default:jsonb('[]')" json:"input_params"`
}

// InputParam defines a user-facing input field for a flow.
// Values supplied by the user at execution time are stored as InputValues on the Execution.
type InputParam struct {
	ID          string   `json:"id"`
	Name        string   `json:"name"`
	Label       string   `json:"label"`
	Description string   `json:"description"`
	Type        string   `json:"type"` // text | number | boolean | select | textarea
	Required    bool     `json:"required"`
	Default     string   `json:"default"`
	Options     []Option `json:"options,omitempty"` // for type=select
	Order       int      `json:"order"`
}

type NodePosition struct {
	X float64 `json:"x"`
	Y float64 `json:"y"`
}

type Action struct {
	ID                uuid.UUID    `json:"id"`
	Name              string       `json:"name"`
	Description       string       `json:"description"`
	Plugin            string       `json:"plugin"`
	Version           string       `json:"version"`
	Icon              string       `json:"icon"`
	Category          string       `json:"category"`
	Active            bool         `json:"active"`
	Params            []Params     `json:"params"`
	CustomName        string       `json:"custom_name"`
	CustomDescription string       `json:"custom_description"`
	FailurePipelineID string       `json:"failure_pipeline_id"`
	UpdateAvailable   bool         `json:"update_available"`
	UpdateVersion     string       `json:"update_version,omitempty"`
	UpdatedAction     *Action      `json:"updated_action,omitempty"`
	Condition         Condition    `json:"condition,omitempty"`
	DependsOn         []string     `json:"depends_on,omitempty"`
	Position          NodePosition `json:"position,omitempty"`
}

type Params struct {
	Key         string    `json:"key"`
	Title       string    `json:"title"`
	Description string    `json:"description"`
	Category    string    `json:"category"`
	Required    bool      `json:"required"`
	Type        string    `json:"type"`
	Value       string    `json:"value"`
	Default     string    `json:"default"`
	Options     []Option  `json:"options,omitempty"`
	DependsOn   DependsOn `json:"depends_on,omitempty"`
}

type DependsOn struct {
	Key   string `json:"key"`
	Value string `json:"value"`
}

type Option struct {
	Key   string `json:"key"`
	Value string `json:"value"`
}

type FailurePipeline struct {
	ID           uuid.UUID `json:"id"`
	Name         string    `json:"name"`
	Actions      []Action  `json:"actions"`
	ExecParallel bool      `json:"exec_parallel"`
}

type Condition struct {
	SelectedActionID string          `json:"selected_action_id"`
	ConditionItems   []ConditionItem `json:"condition_items"`
	CancelExecution  bool            `json:"cancel_execution"`
}

type ConditionItem struct {
	ConditionKey   string `json:"condition_key"`
	ConditionType  string `json:"condition_type"`
	ConditionValue string `json:"condition_value"`
	ConditionLogic string `json:"condition_logic"` // e.g., "AND", "OR"
}

type Pattern struct {
	Key   string `json:"key"`
	Value string `json:"value"`
	Type  string `json:"type"`
}
