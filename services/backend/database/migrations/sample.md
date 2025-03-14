package migrations

import (
	"context"
	"fmt"

	log "github.com/sirupsen/logrus"
	"github.com/uptrace/bun"
)

func init() {
	Migrations.MustRegister(func(ctx context.Context, db *bun.DB) error {
		return addGhostAndTotalStepsToExecutions(ctx, db)
	}, func(ctx context.Context, db *bun.DB) error {
		return removeGhostAndTotalStepsFromExecutions(ctx, db)
	})
}

func addGhostAndTotalStepsToExecutions(ctx context.Context, db *bun.DB) error {
	// add ghost column
	exists, err := columnExists(ctx, db, "executions", "ghost")
	if err != nil {
		return fmt.Errorf("failed to check if ghost column exists: %v", err)
	}
	if !exists {
		_, err := db.NewAddColumn().
			Table("executions").
			ColumnExpr("ghost BOOL DEFAULT false").
			Exec(ctx)

		if err != nil {
			return fmt.Errorf("failed to add ghost column to executions table: %v", err)
		}
	} else {
		log.Debug("ghost column already exists in executions table")
	}

	// add total_steps column
	exists, err = columnExists(ctx, db, "executions", "total_steps")
	if err != nil {
		return fmt.Errorf("failed to check if ghost column exists: %v", err)
	}
	if !exists {
		_, err = db.NewAddColumn().
			Table("executions").
			ColumnExpr("total_steps INT DEFAULT 0").
			Exec(ctx)

		if err != nil {
			return fmt.Errorf("failed to add total_steps column to executions table: %v", err)
		}
		log.Info("Added ghost and total_steps columns to executions table")
	} else {
		log.Debug("total_steps column already exists in executions table")
	}
	return nil
}

func removeGhostAndTotalStepsFromExecutions(ctx context.Context, db *bun.DB) error {
	exists, err := columnExists(ctx, db, "executions", "ghost")
	if err != nil {
		return fmt.Errorf("failed to check if ghost column exists: %v", err)
	}
	if exists {
		_, err := db.NewDropColumn().
			Table("executions").
			Column("ghost").
			Exec(ctx)

		if err != nil {
			return fmt.Errorf("failed to remove ghost column from executions table: %v", err)
		}
	} else {
		log.Debug("ghost column already removed from executions table")
	}

	exists, err = columnExists(ctx, db, "executions", "total_steps")
	if err != nil {
		return fmt.Errorf("failed to check if ghost column exists: %v", err)
	}
	if exists {
		_, err = db.NewDropColumn().
			Table("executions").
			Column("total_steps").
			Exec(ctx)

		if err != nil {
			return fmt.Errorf("failed to remove total_steps column from executions table: %v", err)
		}
		fmt.Println("Removed ghost and total_steps columns from executions table")
	} else {
		log.Debug("total_steps column already removed from executions table")
	}

	return nil
}
