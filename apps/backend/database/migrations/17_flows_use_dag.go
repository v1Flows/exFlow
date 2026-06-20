package migrations

import (
	"context"
	"fmt"

	log "github.com/sirupsen/logrus"
	"github.com/uptrace/bun"
)

func init() {
	Migrations.MustRegister(func(ctx context.Context, db *bun.DB) error {
		return addUseDagToFlows(ctx, db)
	}, func(ctx context.Context, db *bun.DB) error {
		return removeUseDagFromFlows(ctx, db)
	})
}

func addUseDagToFlows(ctx context.Context, db *bun.DB) error {
	exists, err := columnExists(ctx, db, "flows", "use_dag")
	if err != nil {
		return fmt.Errorf("failed to check if use_dag column exists: %v", err)
	}
	if !exists {
		_, err := db.NewAddColumn().
			Table("flows").
			ColumnExpr("use_dag BOOLEAN DEFAULT FALSE").
			Exec(ctx)
		if err != nil {
			return fmt.Errorf("failed to add use_dag column to flows table: %v", err)
		}
	} else {
		log.Debug("use_dag column already exists in flows table")
	}
	return nil
}

func removeUseDagFromFlows(ctx context.Context, db *bun.DB) error {
	exists, err := columnExists(ctx, db, "flows", "use_dag")
	if err != nil {
		return fmt.Errorf("failed to check if use_dag column exists: %v", err)
	}
	if exists {
		_, err := db.NewDropColumn().
			Table("flows").
			Column("use_dag").
			Exec(ctx)
		if err != nil {
			return fmt.Errorf("failed to remove use_dag column from flows table: %v", err)
		}
	} else {
		log.Debug("use_dag column already removed from flows table")
	}
	return nil
}
