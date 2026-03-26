package migrations

import (
	"context"
	"fmt"

	log "github.com/sirupsen/logrus"
	"github.com/uptrace/bun"
)

func init() {
	Migrations.MustRegister(func(ctx context.Context, db *bun.DB) error {
		return addInputValuesToExecutions(ctx, db)
	}, func(ctx context.Context, db *bun.DB) error {
		return removeInputValuesFromExecutions(ctx, db)
	})
}

func addInputValuesToExecutions(ctx context.Context, db *bun.DB) error {
	exists, err := columnExists(ctx, db, "executions", "input_values")
	if err != nil {
		return fmt.Errorf("failed to check if input_values column exists: %v", err)
	}
	if !exists {
		_, err := db.NewAddColumn().
			Table("executions").
			ColumnExpr("input_values JSONB DEFAULT '{}'").
			Exec(ctx)
		if err != nil {
			return fmt.Errorf("failed to add input_values column to executions table: %v", err)
		}
	} else {
		log.Debug("input_values column already exists in executions table")
	}
	return nil
}

func removeInputValuesFromExecutions(ctx context.Context, db *bun.DB) error {
	exists, err := columnExists(ctx, db, "executions", "input_values")
	if err != nil {
		return fmt.Errorf("failed to check if input_values column exists: %v", err)
	}
	if exists {
		_, err := db.NewDropColumn().
			Table("executions").
			Column("input_values").
			Exec(ctx)
		if err != nil {
			return fmt.Errorf("failed to remove input_values column from executions table: %v", err)
		}
	} else {
		log.Debug("input_values column already removed from executions table")
	}
	return nil
}
