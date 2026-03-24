package steps

import (
	"github.com/JustLABv1/justflow/pkg/contracts"
)

func GetStepByActionName(steps []models.ExecutionSteps, actionName string) models.ExecutionSteps {
	for _, step := range steps {
		if step.Action.Name == actionName {
			return step
		}
	}
	return models.ExecutionSteps{}
}
