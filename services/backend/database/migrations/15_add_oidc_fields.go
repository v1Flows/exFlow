package migrations

import (
	"context"
	"fmt"

	log "github.com/sirupsen/logrus"
	"github.com/uptrace/bun"
)

func init() {
	Migrations.MustRegister(func(ctx context.Context, db *bun.DB) error {
		return addOIDCColumnsToUsers(ctx, db)
	}, func(ctx context.Context, db *bun.DB) error {
		return removeOIDCColumnsFromUsers(ctx, db)
	})
}

func addOIDCColumnsToUsers(ctx context.Context, db *bun.DB) error {
	// Check if oidc_provider column already exists
	exists, err := columnExists(ctx, db, "users", "oidc_provider")
	if err != nil {
		return fmt.Errorf("failed to check if oidc_provider column exists: %v", err)
	}

	if !exists {
		_, err := db.NewAddColumn().
			Table("users").
			ColumnExpr("oidc_provider text DEFAULT ''").
			Exec(ctx)

		if err != nil {
			return fmt.Errorf("failed to add oidc_provider column to users table: %v", err)
		}
		log.Info("Added oidc_provider column to users table")
	} else {
		log.Debug("oidc_provider column already exists in users table")
	}

	// Check if oidc_provider_user_id column already exists
	exists, err = columnExists(ctx, db, "users", "oidc_provider_user_id")
	if err != nil {
		return fmt.Errorf("failed to check if oidc_provider_user_id column exists: %v", err)
	}

	if !exists {
		_, err := db.NewAddColumn().
			Table("users").
			ColumnExpr("oidc_provider_user_id text DEFAULT ''").
			Exec(ctx)

		if err != nil {
			return fmt.Errorf("failed to add oidc_provider_user_id column to users table: %v", err)
		}
		log.Info("Added oidc_provider_user_id column to users table")
	} else {
		log.Debug("oidc_provider_user_id column already exists in users table")
	}

	return nil
}

func removeOIDCColumnsFromUsers(ctx context.Context, db *bun.DB) error {
	// Rollback function - remove the columns
	exists, err := columnExists(ctx, db, "users", "oidc_provider")
	if err != nil {
		return fmt.Errorf("failed to check if oidc_provider column exists: %v", err)
	}

	if exists {
		_, err := db.NewDropColumn().
			Table("users").
			Column("oidc_provider").
			Exec(ctx)

		if err != nil {
			return fmt.Errorf("failed to remove oidc_provider column from users table: %v", err)
		}
	}

	exists, err = columnExists(ctx, db, "users", "oidc_provider_user_id")
	if err != nil {
		return fmt.Errorf("failed to check if oidc_provider_user_id column exists: %v", err)
	}

	if exists {
		_, err := db.NewDropColumn().
			Table("users").
			Column("oidc_provider_user_id").
			Exec(ctx)

		if err != nil {
			return fmt.Errorf("failed to remove oidc_provider_user_id column from users table: %v", err)
		}
	}

	return nil
}
