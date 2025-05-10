package migrations

import (
	"context"
	"fmt"

	log "github.com/sirupsen/logrus"
	"github.com/uptrace/bun"
)

func init() {
	Migrations.MustRegister(func(ctx context.Context, db *bun.DB) error {
		return addApiURLToRunners(ctx, db)
	}, func(ctx context.Context, db *bun.DB) error {
		return removeApiURLFromRunners(ctx, db)
	})
}

func addApiURLToRunners(ctx context.Context, db *bun.DB) error {
	// add api_url column
	exists, err := columnExists(ctx, db, "runners", "api_url")
	if err != nil {
		return fmt.Errorf("failed to check if api_url column exists: %v", err)
	}
	if !exists {
		_, err := db.NewAddColumn().
			Table("runners").
			ColumnExpr("api_url TEXT DEFAULT ''").
			Exec(ctx)

		if err != nil {
			return fmt.Errorf("failed to add api_url column to runners table: %v", err)
		}
	} else {
		log.Debug("api_url column already exists in runners table")
	}

	return nil
}

func removeApiURLFromRunners(ctx context.Context, db *bun.DB) error {
	exists, err := columnExists(ctx, db, "runners", "api_url")
	if err != nil {
		return fmt.Errorf("failed to check if api_url column exists: %v", err)
	}
	if exists {
		_, err := db.NewDropColumn().
			Table("runners").
			Column("api_url").
			Exec(ctx)

		if err != nil {
			return fmt.Errorf("failed to remove api_url column from runners table: %v", err)
		}
	} else {
		log.Debug("api_url column already removed from runners table")
	}

	return nil
}
