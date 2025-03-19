package functions

import (
	"context"

	"github.com/v1Flows/exFlow/services/backend/pkg/models"

	"github.com/google/uuid"
	"github.com/uptrace/bun"
)

func PreStartExecution(flowID string, flow models.Flows, db *bun.DB) error {
	context := context.Background()

	var execution models.Executions

	if flow.RunnerID != "" {
		execution.RunnerID = flow.RunnerID
	}

	execution.ID = uuid.New()
	execution.FlowID = flowID
	execution.Status = "pending"
	_, err := db.NewInsert().Model(&execution).Column("id", "flow_id", "status", "executed_at").Exec(context)
	if err != nil {
		return err
	}

	return nil
}
