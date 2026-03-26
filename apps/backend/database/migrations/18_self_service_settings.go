package migrations

import (
	"context"
	"fmt"

	log "github.com/sirupsen/logrus"
	"github.com/uptrace/bun"
)

func init() {
	Migrations.MustRegister(func(ctx context.Context, db *bun.DB) error {
		return addCreateSelfServicePagesToSettings(ctx, db)
	}, func(ctx context.Context, db *bun.DB) error {
		return removeCreateSelfServicePagesFromSettings(ctx, db)
	})
}

func addCreateSelfServicePagesToSettings(ctx context.Context, db *bun.DB) error {
	exists, err := columnExists(ctx, db, "settings", "create_self_service_pages")
	if err != nil {
		return fmt.Errorf("failed to check if create_self_service_pages column exists: %v", err)
	}
	if !exists {
		_, err := db.NewAddColumn().
			Table("settings").
			ColumnExpr("create_self_service_pages BOOLEAN DEFAULT TRUE").
			Exec(ctx)
		if err != nil {
			return fmt.Errorf("failed to add create_self_service_pages column to settings table: %v", err)
		}
	} else {
		log.Debug("create_self_service_pages column already exists in settings table")
	}
	return nil
}

func removeCreateSelfServicePagesFromSettings(ctx context.Context, db *bun.DB) error {
	exists, err := columnExists(ctx, db, "settings", "create_self_service_pages")
	if err != nil {
		return fmt.Errorf("failed to check if create_self_service_pages column exists: %v", err)
	}
	if exists {
		_, err := db.NewDropColumn().
			Table("settings").
			Column("create_self_service_pages").
			Exec(ctx)
		if err != nil {
			return fmt.Errorf("failed to remove create_self_service_pages column from settings table: %v", err)
		}
	} else {
		log.Debug("create_self_service_pages column already removed from settings table")
	}
	return nil
}
