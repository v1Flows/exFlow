package migrations

import (
	"context"
	"fmt"

	log "github.com/sirupsen/logrus"
	"github.com/uptrace/bun"
)

func init() {
	Migrations.MustRegister(func(ctx context.Context, db *bun.DB) error {
		return createSelfServicePagesTable(ctx, db)
	}, func(ctx context.Context, db *bun.DB) error {
		return dropSelfServicePagesTable(ctx, db)
	})
}

func createSelfServicePagesTable(ctx context.Context, db *bun.DB) error {
	exists, err := tableExists(ctx, db, "self_service_pages")
	if err != nil {
		return fmt.Errorf("failed to check if self_service_pages table exists: %v", err)
	}
	if !exists {
		_, err := db.ExecContext(ctx, `
			CREATE TABLE self_service_pages (
				id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
				name        TEXT NOT NULL,
				description TEXT NOT NULL DEFAULT '',
				slug        TEXT NOT NULL UNIQUE,
				project_id  TEXT NOT NULL,
				created_by  TEXT NOT NULL,
				icon        TEXT NOT NULL DEFAULT '',
				color       TEXT NOT NULL DEFAULT '',
				enabled     BOOLEAN NOT NULL DEFAULT TRUE,
				page_flows  JSONB NOT NULL DEFAULT '[]',
				created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
				updated_at  TIMESTAMPTZ
			)
		`)
		if err != nil {
			return fmt.Errorf("failed to create self_service_pages table: %v", err)
		}
		_, err = db.ExecContext(ctx, `CREATE INDEX idx_self_service_pages_project_id ON self_service_pages (project_id)`)
		if err != nil {
			return fmt.Errorf("failed to create index on self_service_pages: %v", err)
		}
	} else {
		log.Debug("self_service_pages table already exists")
	}
	return nil
}

func dropSelfServicePagesTable(ctx context.Context, db *bun.DB) error {
	exists, err := tableExists(ctx, db, "self_service_pages")
	if err != nil {
		return fmt.Errorf("failed to check if self_service_pages table exists: %v", err)
	}
	if exists {
		_, err := db.ExecContext(ctx, `DROP TABLE self_service_pages`)
		if err != nil {
			return fmt.Errorf("failed to drop self_service_pages table: %v", err)
		}
	} else {
		log.Debug("self_service_pages table already dropped")
	}
	return nil
}
