package models

import (
	"encoding/json"
	"time"

	"github.com/google/uuid"
)

type Flows struct {
	ID                     uuid.UUID         `json:"id"`
	Name                   string            `json:"name"`
	Description            string            `json:"description"`
	Type                   string            `json:"type"`
	ProjectID              string            `json:"project_id"`
	RunnerID               string            `json:"runner_id"`
	ExecParallel           bool              `json:"exec_parallel"`
	UseDag                 bool              `json:"use_dag"`
	Actions                []Action          `json:"actions"`
	Maintenance            bool              `json:"maintenance"`
	MaintenanceMessage     string            `json:"maintenance_message"`
	Disabled               bool              `json:"disabled"`
	DisabledReason         string            `json:"disabled_reason"`
	CreatedAt              time.Time         `json:"created_at"`
	UpdatedAt              time.Time         `json:"updated_at"`
	FailurePipelines       []FailurePipeline `json:"failure_pipelines"`
	FailurePipelineID      string            `json:"failure_pipeline_id"`
	FolderID               string            `json:"folder_id"`
	ScheduleEveryValue     int               `json:"schedule_every_value"`
	ScheduleEveryUnit      string            `json:"schedule_every_unit"`
	Patterns               []Pattern         `json:"patterns"`
	GroupAlerts            bool              `json:"group_alerts"`
	GroupAlertsIdentifier  string            `json:"group_alerts_identifier"`
	AlertThreshold         int               `json:"alert_threshold"`
	AlwaysCleanupWorkspace bool              `json:"always_cleanup_workspace"`
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
	ConditionLogic string `json:"condition_logic"`
}

type Pattern struct {
	Key   string `json:"key"`
	Value string `json:"value"`
	Type  string `json:"type"`
}

type Executions struct {
	ID            uuid.UUID              `json:"id"`
	FlowID        string                 `json:"flow_id"`
	RunnerID      string                 `json:"runner_id"`
	Status        string                 `json:"status"`
	CreatedAt     time.Time              `json:"created_at"`
	ExecutedAt    time.Time              `json:"executed_at"`
	FinishedAt    time.Time              `json:"finished_at"`
	LastHeartbeat time.Time              `json:"last_heartbeat"`
	ScheduledAt   time.Time              `json:"scheduled_at"`
	TriggeredBy   string                 `json:"triggered_by"`
	AlertID       string                 `json:"alert_id"`
	InputValues   map[string]interface{} `json:"input_values"`
}

type ExecutionSteps struct {
	ID                  uuid.UUID `json:"id"`
	ExecutionID         string    `json:"execution_id"`
	Action              Action    `json:"action"`
	Messages            []Message `json:"messages"`
	RunnerID            string    `json:"runner_id"`
	ParentID            string    `json:"parent_id"`
	IsHidden            bool      `json:"is_hidden"`
	Status              string    `json:"status"`
	Encrypted           bool      `json:"encrypted"`
	Interactive         bool      `json:"interactive"`
	Interacted          bool      `json:"interacted"`
	InteractionApproved bool      `json:"interaction_approved"`
	InteractionRejected bool      `json:"interaction_rejected"`
	InteractedBy        string    `json:"interacted_by"`
	InteractedAt        time.Time `json:"interacted_at"`
	CanceledBy          string    `json:"canceled_by"`
	CanceledAt          time.Time `json:"canceled_at"`
	CreatedAt           time.Time `json:"created_at"`
	StartedAt           time.Time `json:"started_at"`
	FinishedAt          time.Time `json:"finished_at"`
}

type Message struct {
	Title string `json:"title"`
	Lines []Line `json:"lines"`
}

type Line struct {
	Content   string    `json:"content"`
	Color     string    `json:"color"`
	Timestamp time.Time `json:"timestamp"`
}

type Alerts struct {
	ID          uuid.UUID       `json:"id"`
	Name        string          `json:"name"`
	Status      string          `json:"status"`
	Payload     json.RawMessage `json:"payload"`
	FlowID      string          `json:"flow_id"`
	ExecutionID string          `json:"execution_id"`
	RunnerID    string          `json:"runner_id"`
	ParentID    string          `json:"parent_id"`
	Plugin      string          `json:"plugin"`
	CreatedAt   time.Time       `json:"created_at"`
	Encrypted   bool            `json:"encrypted"`
	UpdatedAt   time.Time       `json:"updated_at"`
	ResolvedAt  time.Time       `json:"resolved_at"`
	GroupKey    string          `json:"group_key"`
	SubAlerts   []SubAlerts     `json:"sub_alerts"`
	Note        string          `json:"note"`
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

type Runners struct {
	ID                 uuid.UUID  `json:"id"`
	Name               string     `json:"name"`
	Registered         bool       `json:"registered"`
	ProjectID          string     `json:"project_id"`
	Version            string     `json:"version"`
	Mode               string     `json:"mode"`
	AutoRunner         bool       `json:"auto_runner"`
	SharedRunner       bool       `json:"shared_runner"`
	LastHeartbeat      time.Time  `json:"last_heartbeat"`
	ExecutingJob       bool       `json:"executing_job"`
	Disabled           bool       `json:"disabled"`
	DisabledReason     string     `json:"disabled_reason"`
	Plugins            []Plugin   `json:"plugins"`
	Actions            []Action   `json:"actions"`
	Endpoints          []Endpoint `json:"endpoints"`
	RegisteredAt       time.Time  `json:"registered_at"`
	ExecutedExecutions []string   `json:"executed_executions"`
	ApiURL             string     `json:"api_url"`
	ApiToken           string     `json:"api_token"`
}

type Endpoint struct {
	ID    string `json:"id"`
	Name  string `json:"name"`
	Path  string `json:"path"`
	Icon  string `json:"icon"`
	Color string `json:"color"`
}

type Plugin struct {
	Name     string   `json:"name"`
	Type     string   `json:"type"`
	Version  string   `json:"version"`
	Author   string   `json:"author"`
	Action   Action   `json:"action"`
	Endpoint Endpoint `json:"endpoint"`
}
