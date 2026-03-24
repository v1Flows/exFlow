package migrations

import (
	"context"
	"fmt"

	log "github.com/sirupsen/logrus"
	"github.com/uptrace/bun"
)

func init() {
	Migrations.MustRegister(func(ctx context.Context, db *bun.DB) error {
		return addLastHeartbeatToExecution(ctx, db)
	}, func(ctx context.Context, db *bun.DB) error {
		return removeLastHeartbeatFromExecution(ctx, db)
	})
}

func addLastHeartbeatToExecution(ctx context.Context, db *bun.DB) error {
	// add last_heartbeat column
	exists, err := columnExists(ctx, db, "executions", "last_heartbeat")
	if err != nil {
		return fmt.Errorf("failed to check if last_heartbeat column exists: %v", err)
	}
	if !exists {
		_, err := db.NewAddColumn().
			Table("executions").
			ColumnExpr("last_heartbeat TIMESTAMPTZ").
			Exec(ctx)

		if err != nil {
			return fmt.Errorf("failed to add last_heartbeat column to executions table: %v", err)
		}
	} else {
		log.Debug("last_heartbeat column already exists in executions table")
	}

	return nil
}

func removeLastHeartbeatFromExecution(ctx context.Context, db *bun.DB) error {
	exists, err := columnExists(ctx, db, "executions", "last_heartbeat")
	if err != nil {
		return fmt.Errorf("failed to check if last_heartbeat column exists: %v", err)
	}
	if exists {
		_, err := db.NewDropColumn().
			Table("executions").
			Column("last_heartbeat").
			Exec(ctx)

		if err != nil {
			return fmt.Errorf("failed to remove last_heartbeat column from executions table: %v", err)
		}
	} else {
		log.Debug("last_heartbeat column already removed from executions table")
	}

	return nil
}
