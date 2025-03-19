package models

import (
	"github.com/uptrace/bun"
)

type Settings struct {
	bun.BaseModel `bun:"table:settings"`

	ID                        int    `bun:"id,type:integer,pk,default:1" json:"id"`
	Maintenance               bool   `bun:"maintenance,type:bool,default:false" json:"maintenance"`
	SignUp                    bool   `bun:"signup,type:bool,default:true" json:"signup"`
	CreateProjects            bool   `bun:"create_projects,type:bool,default:true" json:"create_projects"`
	CreateFlows               bool   `bun:"create_flows,type:bool,default:true" json:"create_flows"`
	CreateRunners             bool   `bun:"create_runners,type:bool,default:true" json:"create_runners"`
	CreateApiKeys             bool   `bun:"create_api_keys,type:bool,default:true" json:"create_api_keys"`
	AddProjectMembers         bool   `bun:"add_project_members,type:bool,default:true" json:"add_project_members"`
	AddFlowActions            bool   `bun:"add_flow_actions,type:bool,default:true" json:"add_flow_actions"`
	StartExecutions           bool   `bun:"start_executions,type:bool,default:true" json:"start_executions"`
	AllowSharedRunnerAutoJoin bool   `bun:"allow_shared_runner_auto_join,type:bool,default:true" json:"allow_shared_runner_auto_join"`
	AllowSharedRunnerJoin     bool   `bun:"allow_shared_runner_join,type:bool,default:true" json:"allow_shared_runner_join"`
	SharedRunnerAutoJoinToken string `bun:"shared_runner_auto_join_token,type:text,default:''" json:"shared_runner_auto_join_token"`
}
