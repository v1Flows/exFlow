package migrations

import (
	"context"
	"fmt"

	log "github.com/sirupsen/logrus"
	"github.com/uptrace/bun"
)

func init() {
	Migrations.MustRegister(func(ctx context.Context, db *bun.DB) error {
		return addNewEncryptionMigratedToSettings(ctx, db)
	}, func(ctx context.Context, db *bun.DB) error {
		return removeNewEncryptionMigratedFromSettings(ctx, db)
	})
}

func addNewEncryptionMigratedToSettings(ctx context.Context, db *bun.DB) error {
	// add new_encryption_migrated column
	exists, err := columnExists(ctx, db, "settings", "new_encryption_migrated")
	if err != nil {
		return fmt.Errorf("failed to check if new_encryption_migrated column exists: %v", err)
	}
	if !exists {
		_, err := db.NewAddColumn().
			Table("settings").
			ColumnExpr("new_encryption_migrated BOOLEAN DEFAULT FALSE").
			Exec(ctx)

		if err != nil {
			return fmt.Errorf("failed to add new_encryption_migrated column to settings table: %v", err)
		}
	} else {
		log.Debug("new_encryption_migrated column already exists in settings table")
	}

	return nil
}

func removeNewEncryptionMigratedFromSettings(ctx context.Context, db *bun.DB) error {
	exists, err := columnExists(ctx, db, "settings", "new_encryption_migrated")
	if err != nil {
		return fmt.Errorf("failed to check if new_encryption_migrated column exists: %v", err)
	}
	if exists {
		_, err := db.NewDropColumn().
			Table("settings").
			Column("new_encryption_migrated").
			Exec(ctx)

		if err != nil {
			return fmt.Errorf("failed to remove new_encryption_migrated column from settings table: %v", err)
		}
	} else {
		log.Debug("new_encryption_migrated column already removed from settings table")
	}

	return nil
}
