package migrations

import (
	"context"
	"fmt"

	"github.com/v1Flows/exFlow/services/backend/pkg/models"

	"github.com/uptrace/bun"
)

func init() {
	Migrations.MustRegister(func(ctx context.Context, db *bun.DB) error {
		return createAlertsSchema(ctx, db)
	}, func(ctx context.Context, db *bun.DB) error {
		return dropAlertsSchema(ctx, db)
	})
}

func createAlertsSchema(ctx context.Context, db *bun.DB) error {
	models := []interface{}{
		(*models.Alerts)(nil),
	}

	for _, model := range models {
		_, err := db.NewCreateTable().Model(model).IfNotExists().Exec(ctx)
		if err != nil {
			return fmt.Errorf("failed to create table: %v", err)
		}
	}

	return nil
}

func dropAlertsSchema(ctx context.Context, db *bun.DB) error {
	models := []interface{}{
		(*models.Alerts)(nil),
	}

	for _, model := range models {
		_, err := db.NewDropTable().Model(model).IfExists().Cascade().Exec(ctx)
		if err != nil {
			return fmt.Errorf("failed to drop table: %v", err)
		}
	}

	return nil
}
