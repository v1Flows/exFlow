package migrations

import (
	"context"
	"fmt"

	log "github.com/sirupsen/logrus"
	"github.com/uptrace/bun"
)

func init() {
	Migrations.MustRegister(func(ctx context.Context, db *bun.DB) error {
		return addAlwaysCleanupWorkspaceToFlows(ctx, db)
	}, func(ctx context.Context, db *bun.DB) error {
		return removeAlwaysCleanupWorkspaceFromFlows(ctx, db)
	})
}

func addAlwaysCleanupWorkspaceToFlows(ctx context.Context, db *bun.DB) error {
	// add api_url column
	exists, err := columnExists(ctx, db, "flows", "always_cleanup_workspace")
	if err != nil {
		return fmt.Errorf("failed to check if always_cleanup_workspace column exists: %v", err)
	}
	if !exists {
		_, err := db.NewAddColumn().
			Table("flows").
			ColumnExpr("always_cleanup_workspace BOOLEAN DEFAULT false").
			Exec(ctx)

		if err != nil {
			return fmt.Errorf("failed to add always_cleanup_workspace column to flows table: %v", err)
		}
	} else {
		log.Debug("always_cleanup_workspace column already exists in flows table")
	}

	return nil
}

func removeAlwaysCleanupWorkspaceFromFlows(ctx context.Context, db *bun.DB) error {
	exists, err := columnExists(ctx, db, "flows", "always_cleanup_workspace")
	if err != nil {
		return fmt.Errorf("failed to check if always_cleanup_workspace column exists: %v", err)
	}
	if exists {
		_, err := db.NewDropColumn().
			Table("flows").
			Column("always_cleanup_workspace").
			Exec(ctx)

		if err != nil {
			return fmt.Errorf("failed to remove always_cleanup_workspace column from flows table: %v", err)
		}
	} else {
		log.Debug("always_cleanup_workspace column already removed from flows table")
	}

	return nil
}
