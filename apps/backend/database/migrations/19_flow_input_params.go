package migrations

import (
	"context"
	"fmt"

	log "github.com/sirupsen/logrus"
	"github.com/uptrace/bun"
)

func init() {
	Migrations.MustRegister(func(ctx context.Context, db *bun.DB) error {
		return addInputParamsToFlows(ctx, db)
	}, func(ctx context.Context, db *bun.DB) error {
		return removeInputParamsFromFlows(ctx, db)
	})
}

func addInputParamsToFlows(ctx context.Context, db *bun.DB) error {
	exists, err := columnExists(ctx, db, "flows", "input_params")
	if err != nil {
		return fmt.Errorf("failed to check if input_params column exists: %v", err)
	}
	if !exists {
		_, err := db.NewAddColumn().
			Table("flows").
			ColumnExpr("input_params JSONB DEFAULT '[]'").
			Exec(ctx)
		if err != nil {
			return fmt.Errorf("failed to add input_params column to flows table: %v", err)
		}
	} else {
		log.Debug("input_params column already exists in flows table")
	}
	return nil
}

func removeInputParamsFromFlows(ctx context.Context, db *bun.DB) error {
	exists, err := columnExists(ctx, db, "flows", "input_params")
	if err != nil {
		return fmt.Errorf("failed to check if input_params column exists: %v", err)
	}
	if exists {
		_, err := db.NewDropColumn().
			Table("flows").
			Column("input_params").
			Exec(ctx)
		if err != nil {
			return fmt.Errorf("failed to remove input_params column from flows table: %v", err)
		}
	} else {
		log.Debug("input_params column already removed from flows table")
	}
	return nil
}
