package models

import (
	"time"

	jf_models "github.com/JustLABv1/justflow/pkg/contracts"
)

type Register struct {
	ID             string                     `json:"id"`
	Registered     bool                       `json:"registered"`
	LastHeartbeat  time.Time                  `json:"last_heartbeat"`
	Version        string                     `json:"version"`
	Mode           string                     `json:"mode"`
	Plugins        []jf_models.Plugin         `json:"plugins"`
	Actions        []jf_models.Action         `json:"actions"`
	AlertEndpoints []jf_models.AlertEndpoints `json:"alert_endpoints"`
}
