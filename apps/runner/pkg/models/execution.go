package models

import "github.com/JustLABv1/justflow/pkg/contracts"

type IncomingExecution struct {
	ExecutionData models.Executions `json:"execution"`
}
