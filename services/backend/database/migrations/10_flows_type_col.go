package migrations

import (
	"context"
	"fmt"

	log "github.com/sirupsen/logrus"
	"github.com/uptrace/bun"
)

func init() {
	Migrations.MustRegister(func(ctx context.Context, db *bun.DB) error {
		return addTypeToFlows(ctx, db)
	}, func(ctx context.Context, db *bun.DB) error {
		return removeTypeFromFlows(ctx, db)
	})
}

func addTypeToFlows(ctx context.Context, db *bun.DB) error {
	// add type column
	exists, err := columnExists(ctx, db, "flows", "type")
	if err != nil {
		return fmt.Errorf("failed to check if type column exists: %v", err)
	}
	if !exists {
		_, err := db.NewAddColumn().
			Table("flows").
			ColumnExpr("type TEXT DEFAULT 'default'").
			Exec(ctx)

		if err != nil {
			return fmt.Errorf("failed to add type column to flows table: %v", err)
		}
	} else {
		log.Debug("type column already exists in flows table")
	}

	return nil
}

func removeTypeFromFlows(ctx context.Context, db *bun.DB) error {
	exists, err := columnExists(ctx, db, "flows", "type")
	if err != nil {
		return fmt.Errorf("failed to check if type column exists: %v", err)
	}
	if exists {
		_, err := db.NewDropColumn().
			Table("flows").
			Column("type").
			Exec(ctx)

		if err != nil {
			return fmt.Errorf("failed to remove type column from flows table: %v", err)
		}
	} else {
		log.Debug("type column already removed from flows table")
	}

	return nil
}
