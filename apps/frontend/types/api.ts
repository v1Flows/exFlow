/**
 * API type definitions mirroring the Go models in:
 *  - pkg/contracts/types.go
 *  - apps/backend/pkg/models/
 *
 * Keep in sync with the backend whenever models change.
 */

// ---------------------------------------------------------------------------
// Shared primitives
// ---------------------------------------------------------------------------

export type ExecutionStatus =
  | "pending"
  | "running"
  | "paused"
  | "interactionWaiting"
  | "scheduled"
  | "success"
  | "error"
  | "canceled"
  | "noPatternMatch"
  | "recovered";

export type StepStatus =
  | "running"
  | "paused"
  | "interactionWaiting"
  | "success"
  | "error"
  | "warning"
  | "canceled";

export type UserRole = "admin" | "user";
export type RunnerMode = "master" | "worker" | "listener";

// ---------------------------------------------------------------------------
// Core domain types
// ---------------------------------------------------------------------------

export interface Line {
  content: string;
  color: string;
  timestamp: string; // ISO 8601
}

export interface Message {
  title: string;
  lines: Line[];
}

export interface Option {
  key: string;
  value: string;
}

export interface DependsOn {
  key: string;
  value: string;
}

export interface Params {
  key: string;
  title: string;
  description: string;
  category: string;
  required: boolean;
  type: string;
  value: string;
  default: string;
  options?: Option[];
  depends_on?: DependsOn;
}

export interface ConditionItem {
  condition_key: string;
  condition_type: string;
  condition_value: string;
  condition_logic: string;
}

export interface Condition {
  selected_action_id: string;
  condition_items: ConditionItem[];
  cancel_execution: boolean;
}

export interface Action {
  id: string;
  name: string;
  description: string;
  plugin: string;
  version: string;
  icon: string;
  category: string;
  active: boolean;
  params: Params[];
  custom_name: string;
  custom_description: string;
  failure_pipeline_id: string;
  update_available: boolean;
  update_version?: string;
  updated_action?: Action;
  condition?: Condition;
}

export interface FailurePipeline {
  id: string;
  name: string;
  actions: Action[];
  exec_parallel: boolean;
}

export interface Pattern {
  key: string;
  value: string;
  type: string;
}

export interface Flow {
  id: string;
  name: string;
  description: string;
  type: string;
  project_id: string;
  runner_id: string;
  exec_parallel: boolean;
  actions: Action[];
  maintenance: boolean;
  maintenance_message: string;
  disabled: boolean;
  disabled_reason: string;
  created_at: string;
  updated_at: string;
  failure_pipelines: FailurePipeline[];
  failure_pipeline_id: string;
  folder_id: string;
  schedule_every_value: number;
  schedule_every_unit: string;
  patterns: Pattern[];
  group_alerts: boolean;
  group_alerts_identifier: string;
  alert_threshold: number;
  always_cleanup_workspace: boolean;
}

export interface Execution {
  id: string;
  flow_id: string;
  runner_id: string;
  status: ExecutionStatus;
  created_at: string;
  executed_at: string;
  finished_at: string;
  last_heartbeat: string;
  scheduled_at: string;
  triggered_by: string;
  alert_id: string;
}

export interface ExecutionStep {
  id: string;
  execution_id: string;
  action: Action;
  messages: Message[];
  runner_id: string;
  parent_id: string;
  is_hidden: boolean;
  status: StepStatus;
  encrypted: boolean;
  interactive: boolean;
  interacted: boolean;
  interaction_approved: boolean;
  interaction_rejected: boolean;
  interacted_by: string;
  interacted_at: string;
  canceled_by: string;
  canceled_at: string;
  created_at: string;
  started_at: string;
  finished_at: string;
}

export interface Endpoint {
  id: string;
  name: string;
  path: string;
  icon: string;
  color: string;
}

export interface Plugin {
  name: string;
  type: string;
  version: string;
  author: string;
  action: Action;
  endpoint: Endpoint;
}

export interface Runner {
  id: string;
  name: string;
  registered: boolean;
  project_id: string;
  version: string;
  mode: RunnerMode;
  auto_runner: boolean;
  shared_runner: boolean;
  last_heartbeat: string;
  executing_job: boolean;
  disabled: boolean;
  disabled_reason: string;
  plugins: Plugin[];
  actions: Action[];
  endpoints: Endpoint[];
  registered_at: string;
  executed_executions: string[];
  api_url: string;
  api_token: string;
}

export interface SubAlert {
  id: string;
  name: string;
  status: string;
  labels: Record<string, unknown>;
  started_at: string;
  resolved_at: string;
}

export interface Alert {
  id: string;
  name: string;
  status: string;
  payload: Record<string, unknown>;
  flow_id: string;
  execution_id: string;
  runner_id: string;
  parent_id: string;
  plugin: string;
  created_at: string;
  encrypted: boolean;
  updated_at: string;
  resolved_at: string;
  group_key: string;
  sub_alerts: SubAlert[];
  note: string;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  shared_runners: boolean;
  color: string;
  icon: string;
  disabled: boolean;
  disabled_reason: string;
  created_at: string;
  enable_auto_runners: boolean;
  disable_runner_join: boolean;
  runner_auto_join_token: string;
  encryption_key: string;
  encryption_enabled: boolean;
  predefined_flow_actions: Action[];
}

export interface ProjectMember {
  id: string;
  project_id: string;
  user_id: string;
  role: string;
  invited: boolean;
  created_at: string;
}

export interface User {
  id: string;
  username: string;
  email: string;
  email_verified: boolean;
  welcomed: boolean;
  role: UserRole;
  disabled: boolean;
  disabled_reason: string;
  created_at: string;
  updated_at: string;
}

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: string;
  read: boolean;
  archived: boolean;
  created_at: string;
}

export interface Folder {
  id: string;
  name: string;
  description: string;
  project_id: string;
  color: string;
  icon: string;
  created_at: string;
}

export interface Token {
  id: string;
  name: string;
  type: string;
  project_id: string;
  user_id: string;
  disabled: boolean;
  expires_at: string;
  created_at: string;
}

export interface Settings {
  id: number;
  allow_registration: boolean;
  allow_shared_runner_join: boolean;
  allow_shared_runner_auto_join: boolean;
  maintenance: boolean;
  maintenance_message: string;
}

// ---------------------------------------------------------------------------
// Standard API response wrapper
// ---------------------------------------------------------------------------

export interface ApiResponse<T = unknown> {
  success: boolean;
  message?: string;
  error?: string;
  data: T;
}
