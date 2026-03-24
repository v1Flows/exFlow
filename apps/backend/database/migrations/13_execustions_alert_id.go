package migrations

import (
	"context"
	"fmt"

	log "github.com/sirupsen/logrus"
	"github.com/uptrace/bun"
)

func init() {
	Migrations.MustRegister(func(ctx context.Context, db *bun.DB) error {
		return addAlertIDToExecutions(ctx, db)
	}, func(ctx context.Context, db *bun.DB) error {
		return removeAlertIDFromExecutions(ctx, db)
	})
}

func addAlertIDToExecutions(ctx context.Context, db *bun.DB) error {
	// add alert_id column
	exists, err := columnExists(ctx, db, "executions", "alert_id")
	if err != nil {
		return fmt.Errorf("failed to check if alert_id column exists: %v", err)
	}
	if !exists {
		_, err := db.NewAddColumn().
			Table("executions").
			ColumnExpr("alert_id TEXT DEFAULT ''").
			Exec(ctx)

		if err != nil {
			return fmt.Errorf("failed to add alert_id column to executions table: %v", err)
		}
	} else {
		log.Debug("alert_id column already exists in executions table")
	}

	return nil
}

func removeAlertIDFromExecutions(ctx context.Context, db *bun.DB) error {
	exists, err := columnExists(ctx, db, "executions", "alert_id")
	if err != nil {
		return fmt.Errorf("failed to check if alert_id column exists: %v", err)
	}
	if exists {
		_, err := db.NewDropColumn().
			Table("executions").
			Column("alert_id").
			Exec(ctx)

		if err != nil {
			return fmt.Errorf("failed to remove alert_id column from executions table: %v", err)
		}
	} else {
		log.Debug("alert_id column already removed from executions table")
	}

	return nil
}
