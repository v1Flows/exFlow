package migrations

import (
	"context"

	"github.com/uptrace/bun"
	"github.com/uptrace/bun/migrate"
)

var Migrations = migrate.NewMigrations()

func columnExists(ctx context.Context, db *bun.DB, table, column string) (bool, error) {
	exists, err := db.NewSelect().
		Table("information_schema.columns").
		Where("table_name = ? AND column_name = ?", table, column).
		Exists(ctx)

	return exists, err
}

func tableExists(ctx context.Context, db *bun.DB, table string) (bool, error) {
	exists, err := db.NewSelect().
		Table("information_schema.tables").
		Where("table_name = ?", table).
		Exists(ctx)

	return exists, err
}
