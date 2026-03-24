package functions

import (
	"context"
	"database/sql"
	"time"

	"github.com/JustLABv1/justflow/services/backend/pkg/models"
	"github.com/JustLABv1/justflow/services/backend/pkg/telemetry"

	"github.com/google/uuid"
	"github.com/uptrace/bun"
)

func PreStartExecution(flowID string, flow models.Flows, db *bun.DB, alert models.Alerts) error {
	context := context.Background()

	// check when the last alert came in which got executed
	var lastAlert models.Alerts
	count, err := db.NewSelect().Model(&lastAlert).Where("flow_id = ? AND id != ? AND execution_id != ''", flowID, alert.ID).Order("created_at DESC").Limit(1).ScanAndCount(context)
	if err != nil && err != sql.ErrNoRows {
		return err
	}

	if count > 0 {
		// compare the difference between the last alert and the current alert to the flow alert threshold
		if lastAlert.CreatedAt.Add(time.Duration(flow.AlertThreshold) * time.Minute).After(alert.CreatedAt) {
			// set note on alert why it was not executed
			alert.Note = "Alert was not executed because it came in too soon after the last alert"
			_, err = db.NewUpdate().Model(&alert).Column("note").Where("id = ?", alert.ID).Exec(context)
			if err != nil {
				return err
			}

			telemetry.FlowExecutionsTotal.WithLabelValues("skipped", flowID).Inc()
			return nil
		}
	}

	var execution models.Executions

	if flow.RunnerID != "" {
		execution.RunnerID = flow.RunnerID
	}

	execution.ID = uuid.New()
	execution.FlowID = flowID
	execution.Status = "pending"
	execution.AlertID = alert.ID.String()

	_, err = db.NewInsert().Model(&execution).Column("id", "flow_id", "alert_id", "status", "executed_at").Exec(context)
	if err != nil {
		return err
	}

	// set execution id on alert
	alert.ExecutionID = execution.ID.String()
	_, err = db.NewUpdate().Model(&alert).Column("execution_id").Where("id = ?", alert.ID).Exec(context)
	if err != nil {
		return err
	}

	telemetry.FlowExecutionsTotal.WithLabelValues("started", flowID).Inc()

	return nil
}
