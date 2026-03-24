package models

import (
	jf_models "github.com/JustLABv1/justflow/pkg/contracts"
)

type IncomingFlow struct {
	FlowData jf_models.Flows `json:"flow"`
}
