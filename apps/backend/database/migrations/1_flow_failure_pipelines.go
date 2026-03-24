package migrations

import (
	"context"
	"fmt"

	log "github.com/sirupsen/logrus"
	"github.com/uptrace/bun"
)

func init() {
	Migrations.MustRegister(func(ctx context.Context, db *bun.DB) error {
		return addFailurePipelinesToFlows(ctx, db)
	}, func(ctx context.Context, db *bun.DB) error {
		return removeFailurePipelinesFromFlows(ctx, db)
	})
}

func addFailurePipelinesToFlows(ctx context.Context, db *bun.DB) error {
	// add failure_pipelines column
	exists, err := columnExists(ctx, db, "flows", "failure_pipelines")
	if err != nil {
		return fmt.Errorf("failed to check if failure_pipelines column exists: %v", err)
	}
	if !exists {
		_, err := db.NewAddColumn().
			Table("flows").
			ColumnExpr("failure_pipelines JSONB DEFAULT '[]'").
			Exec(ctx)

		if err != nil {
			return fmt.Errorf("failed to add failure_pipelines column to flows table: %v", err)
		}
	} else {
		log.Debug("failure_pipelines column already exists in flows table")
	}

	return nil
}

func removeFailurePipelinesFromFlows(ctx context.Context, db *bun.DB) error {
	exists, err := columnExists(ctx, db, "flows", "failure_pipelines")
	if err != nil {
		return fmt.Errorf("failed to check if failure_pipelines column exists: %v", err)
	}
	if exists {
		_, err := db.NewDropColumn().
			Table("flows").
			Column("failure_pipelines").
			Exec(ctx)

		if err != nil {
			return fmt.Errorf("failed to remove failure_pipelines column from flows table: %v", err)
		}
	} else {
		log.Debug("failure_pipelines column already removed from flows table")
	}

	return nil
}
