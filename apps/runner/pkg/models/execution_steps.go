package models

import "github.com/JustLABv1/justflow/pkg/contracts"

type IncomingExecutionSteps struct {
	StepsData []models.ExecutionSteps `json:"steps"`
}

type IncomingExecutionStep struct {
	StepData models.ExecutionSteps `json:"step"`
}
