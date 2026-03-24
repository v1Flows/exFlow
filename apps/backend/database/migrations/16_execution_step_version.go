package migrations

import (
	"context"
	"fmt"

	log "github.com/sirupsen/logrus"
	"github.com/uptrace/bun"
)

func init() {
	Migrations.MustRegister(func(ctx context.Context, db *bun.DB) error {
		return addVersionToExecutionSteps(ctx, db)
	}, func(ctx context.Context, db *bun.DB) error {
		return removeVersionFromExecutionSteps(ctx, db)
	})
}

func addVersionToExecutionSteps(ctx context.Context, db *bun.DB) error {
	exists, err := columnExists(ctx, db, "execution_steps", "version")
	if err != nil {
		return fmt.Errorf("failed to check if version column exists: %v", err)
	}
	if !exists {
		_, err := db.NewAddColumn().
			Table("execution_steps").
			ColumnExpr("version INTEGER NOT NULL DEFAULT 0").
			Exec(ctx)
		if err != nil {
			return fmt.Errorf("failed to add version column to execution_steps: %v", err)
		}
	} else {
		log.Debug("version column already exists in execution_steps table")
	}
	return nil
}

func removeVersionFromExecutionSteps(ctx context.Context, db *bun.DB) error {
	exists, err := columnExists(ctx, db, "execution_steps", "version")
	if err != nil {
		return fmt.Errorf("failed to check if version column exists: %v", err)
	}
	if exists {
		_, err := db.NewDropColumn().
			Table("execution_steps").
			Column("version").
			Exec(ctx)
		if err != nil {
			return fmt.Errorf("failed to remove version column from execution_steps: %v", err)
		}
	} else {
		log.Debug("version column already removed from execution_steps table")
	}
	return nil
}
