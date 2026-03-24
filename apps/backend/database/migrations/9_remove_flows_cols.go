package migrations

import (
	"context"
	"fmt"

	log "github.com/sirupsen/logrus"
	"github.com/uptrace/bun"
)

func init() {
	Migrations.MustRegister(func(ctx context.Context, db *bun.DB) error {
		return removeColsFromFlow(ctx, db)
	}, func(ctx context.Context, db *bun.DB) error {
		return removeColsFromFlow(ctx, db)
	})
}

func removeColsFromFlow(ctx context.Context, db *bun.DB) error {
	exists, err := columnExists(ctx, db, "flows", "encrypt_action_params")
	if err != nil {
		return fmt.Errorf("failed to check if encrypt_action_params column exists: %v", err)
	}
	if exists {
		_, err := db.NewDropColumn().
			Table("flows").
			Column("encrypt_action_params").
			Exec(ctx)

		if err != nil {
			return fmt.Errorf("failed to remove encrypt_action_params column from flows table: %v", err)
		}
	} else {
		log.Debug("encrypt_action_params column already removed from flows table")
	}

	exists, err = columnExists(ctx, db, "flows", "encrypt_executions")
	if err != nil {
		return fmt.Errorf("failed to check if encrypt_executions column exists: %v", err)
	}
	if exists {
		_, err := db.NewDropColumn().
			Table("flows").
			Column("encrypt_executions").
			Exec(ctx)

		if err != nil {
			return fmt.Errorf("failed to remove encrypt_executions column from flows table: %v", err)
		}
	} else {
		log.Debug("encrypt_executions column already removed from flows table")
	}

	return nil
}
