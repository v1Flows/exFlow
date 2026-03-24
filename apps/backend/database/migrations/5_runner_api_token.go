package migrations

import (
	"context"
	"fmt"

	log "github.com/sirupsen/logrus"
	"github.com/uptrace/bun"
)

func init() {
	Migrations.MustRegister(func(ctx context.Context, db *bun.DB) error {
		return addApiTokenToRunners(ctx, db)
	}, func(ctx context.Context, db *bun.DB) error {
		return removeApiTokenFromRunners(ctx, db)
	})
}

func addApiTokenToRunners(ctx context.Context, db *bun.DB) error {
	// add api_token column
	exists, err := columnExists(ctx, db, "runners", "api_token")
	if err != nil {
		return fmt.Errorf("failed to check if api_token column exists: %v", err)
	}
	if !exists {
		_, err := db.NewAddColumn().
			Table("runners").
			ColumnExpr("api_token TEXT DEFAULT ''").
			Exec(ctx)

		if err != nil {
			return fmt.Errorf("failed to add api_token column to runners table: %v", err)
		}
	} else {
		log.Debug("api_token column already exists in runners table")
	}

	return nil
}

func removeApiTokenFromRunners(ctx context.Context, db *bun.DB) error {
	exists, err := columnExists(ctx, db, "runners", "api_token")
	if err != nil {
		return fmt.Errorf("failed to check if api_token column exists: %v", err)
	}
	if exists {
		_, err := db.NewDropColumn().
			Table("runners").
			Column("api_token").
			Exec(ctx)

		if err != nil {
			return fmt.Errorf("failed to remove api_token column from runners table: %v", err)
		}
	} else {
		log.Debug("api_token column already removed from runners table")
	}

	return nil
}
