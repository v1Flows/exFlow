package migrations

import (
	"context"
	"fmt"

	log "github.com/sirupsen/logrus"
	"github.com/uptrace/bun"
)

func init() {
	Migrations.MustRegister(func(ctx context.Context, db *bun.DB) error {
		return addScheduleEveryToExecution(ctx, db)
	}, func(ctx context.Context, db *bun.DB) error {
		return removeScheduleFromExecution(ctx, db)
	})
}

func addScheduleEveryToExecution(ctx context.Context, db *bun.DB) error {
	// add schedule_every_value column
	exists, err := columnExists(ctx, db, "flows", "schedule_every_value")
	if err != nil {
		return fmt.Errorf("failed to check if schedule_every_value column exists: %v", err)
	}
	if !exists {
		_, err := db.NewAddColumn().
			Table("flows").
			ColumnExpr("schedule_every_value integer default 0").
			Exec(ctx)

		if err != nil {
			return fmt.Errorf("failed to add schedule_every_value column to flows table: %v", err)
		}
	} else {
		log.Debug("schedule_every_value column already exists in flows table")
	}

	// add schedule_every_unit column
	exists, err = columnExists(ctx, db, "flows", "schedule_every_unit")
	if err != nil {
		return fmt.Errorf("failed to check if schedule_every_unit column exists: %v", err)
	}
	if !exists {
		_, err := db.NewAddColumn().
			Table("flows").
			ColumnExpr("schedule_every_unit text default ''").
			Exec(ctx)

		if err != nil {
			return fmt.Errorf("failed to add schedule_every_unit column to flows table: %v", err)
		}
	} else {
		log.Debug("schedule_every_unit column already exists in flows table")
	}

	// add triggered_by column
	exists, err = columnExists(ctx, db, "executions", "triggered_by")
	if err != nil {
		return fmt.Errorf("failed to check if triggered_by column exists: %v", err)
	}
	if !exists {
		_, err := db.NewAddColumn().
			Table("executions").
			ColumnExpr("triggered_by text default 'user'").
			Exec(ctx)

		if err != nil {
			return fmt.Errorf("failed to add triggered_by column to executions table: %v", err)
		}
	} else {
		log.Debug("triggered_by column already exists in executions table")
	}

	return nil
}

func removeScheduleFromExecution(ctx context.Context, db *bun.DB) error {
	exists, err := columnExists(ctx, db, "flows", "schedule_every_value")
	if err != nil {
		return fmt.Errorf("failed to check if schedule_every_value column exists: %v", err)
	}
	if exists {
		_, err := db.NewDropColumn().
			Table("flows").
			Column("schedule_every_value").
			Exec(ctx)

		if err != nil {
			return fmt.Errorf("failed to remove schedule_every_value column from flows table: %v", err)
		}
	} else {
		log.Debug("schedule_every_value column already removed from flows table")
	}

	exists, err = columnExists(ctx, db, "flows", "schedule_every_unit")
	if err != nil {
		return fmt.Errorf("failed to check if schedule_every_unit column exists: %v", err)
	}
	if exists {
		_, err := db.NewDropColumn().
			Table("flows").
			Column("schedule_every_unit").
			Exec(ctx)

		if err != nil {
			return fmt.Errorf("failed to remove schedule_every_unit column from executions table: %v", err)
		}
	} else {
		log.Debug("schedule_every_unit column already removed from executions table")
	}

	exists, err = columnExists(ctx, db, "executions", "triggered_by")
	if err != nil {
		return fmt.Errorf("failed to check if triggered_by column exists: %v", err)
	}
	if exists {
		_, err := db.NewDropColumn().
			Table("executions").
			Column("triggered_by").
			Exec(ctx)

		if err != nil {
			return fmt.Errorf("failed to remove triggered_by column from executions table: %v", err)
		}
	} else {
		log.Debug("triggered_by column already removed from executions table")
	}

	return nil
}
