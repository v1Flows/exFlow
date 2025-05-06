package migrations

import (
	"context"
	"fmt"

	log "github.com/sirupsen/logrus"
	"github.com/uptrace/bun"
)

func init() {
	Migrations.MustRegister(func(ctx context.Context, db *bun.DB) error {
		return addFailurePipelineIDToFlows(ctx, db)
	}, func(ctx context.Context, db *bun.DB) error {
		return removeFailurePipelineIDFromFlows(ctx, db)
	})
}

func addFailurePipelineIDToFlows(ctx context.Context, db *bun.DB) error {
	// add failure_pipeline_id column
	exists, err := columnExists(ctx, db, "flows", "failure_pipeline_id")
	if err != nil {
		return fmt.Errorf("failed to check if failure_pipeline_id column exists: %v", err)
	}
	if !exists {
		_, err := db.NewAddColumn().
			Table("flows").
			ColumnExpr("failure_pipeline_id TEXT DEFAULT ''").
			Exec(ctx)

		if err != nil {
			return fmt.Errorf("failed to add failure_pipeline_id column to flows table: %v", err)
		}
	} else {
		log.Debug("failure_pipeline_id column already exists in flows table")
	}

	return nil
}

func removeFailurePipelineIDFromFlows(ctx context.Context, db *bun.DB) error {
	exists, err := columnExists(ctx, db, "flows", "failure_pipeline_id")
	if err != nil {
		return fmt.Errorf("failed to check if failure_pipeline_id column exists: %v", err)
	}
	if exists {
		_, err := db.NewDropColumn().
			Table("flows").
			Column("failure_pipeline_id").
			Exec(ctx)

		if err != nil {
			return fmt.Errorf("failed to remove failure_pipeline_id column from flows table: %v", err)
		}
	} else {
		log.Debug("failure_pipeline_id column already removed from flows table")
	}

	return nil
}
