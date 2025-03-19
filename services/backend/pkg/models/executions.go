package models

import (
	"time"

	shared_models "github.com/v1Flows/shared-library/pkg/models"
)

type Executions struct {
	shared_models.Executions

	ScheduledAt time.Time `bun:"scheduled_at,type:timestamptz" json:"scheduled_at"`
}
