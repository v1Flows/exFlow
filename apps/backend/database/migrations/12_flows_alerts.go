package migrations

import (
	"context"
	"fmt"

	log "github.com/sirupsen/logrus"
	"github.com/uptrace/bun"
)

func init() {
	Migrations.MustRegister(func(ctx context.Context, db *bun.DB) error {
		return addAlertColsToFlows(ctx, db)
	}, func(ctx context.Context, db *bun.DB) error {
		return removeAlertColsFromFlows(ctx, db)
	})
}

func addAlertColsToFlows(ctx context.Context, db *bun.DB) error {
	// add patterns column
	exists, err := columnExists(ctx, db, "flows", "patterns")
	if err != nil {
		return fmt.Errorf("failed to check if patterns column exists: %v", err)
	}
	if !exists {
		_, err := db.NewAddColumn().
			Table("flows").
			ColumnExpr("patterns JSONB DEFAULT jsonb('[]')").
			Exec(ctx)

		if err != nil {
			return fmt.Errorf("failed to add patterns column to flows table: %v", err)
		}
	} else {
		log.Debug("patterns column already exists in flows table")
	}

	exists, err = columnExists(ctx, db, "flows", "group_alerts")
	if err != nil {
		return fmt.Errorf("failed to check if group_alerts column exists: %v", err)
	}
	if !exists {
		_, err := db.NewAddColumn().
			Table("flows").
			ColumnExpr("group_alerts BOOLEAN DEFAULT true").
			Exec(ctx)

		if err != nil {
			return fmt.Errorf("failed to add group_alerts column to flows table: %v", err)
		}
	} else {
		log.Debug("group_alerts column already exists in flows table")
	}

	exists, err = columnExists(ctx, db, "flows", "group_alerts_identifier")
	if err != nil {
		return fmt.Errorf("failed to check if group_alerts_identifier column exists: %v", err)
	}
	if !exists {
		_, err := db.NewAddColumn().
			Table("flows").
			ColumnExpr("group_alerts_identifier TEXT DEFAULT ''").
			Exec(ctx)

		if err != nil {
			return fmt.Errorf("failed to add group_alerts_identifier column to flows table: %v", err)
		}
	} else {
		log.Debug("group_alerts_identifier column already exists in flows table")
	}

	exists, err = columnExists(ctx, db, "flows", "alert_threshold")
	if err != nil {
		return fmt.Errorf("failed to check if alert_threshold column exists: %v", err)
	}
	if !exists {
		_, err := db.NewAddColumn().
			Table("flows").
			ColumnExpr("alert_threshold INTEGER DEFAULT 0").
			Exec(ctx)

		if err != nil {
			return fmt.Errorf("failed to add alert_threshold column to flows table: %v", err)
		}
	} else {
		log.Debug("alert_threshold column already exists in flows table")
	}

	return nil
}

func removeAlertColsFromFlows(ctx context.Context, db *bun.DB) error {
	exists, err := columnExists(ctx, db, "flows", "patterns")
	if err != nil {
		return fmt.Errorf("failed to check if patterns column exists: %v", err)
	}
	if exists {
		_, err := db.NewDropColumn().
			Table("flows").
			Column("patterns").
			Exec(ctx)

		if err != nil {
			return fmt.Errorf("failed to remove patterns column from flows table: %v", err)
		}
	} else {
		log.Debug("patterns column already removed from flows table")
	}

	exists, err = columnExists(ctx, db, "flows", "group_alerts")
	if err != nil {
		return fmt.Errorf("failed to check if group_alerts column exists: %v", err)
	}
	if exists {
		_, err := db.NewDropColumn().
			Table("flows").
			Column("group_alerts").
			Exec(ctx)

		if err != nil {
			return fmt.Errorf("failed to remove group_alerts column from flows table: %v", err)
		}
	} else {
		log.Debug("group_alerts column already removed from flows table")
	}

	exists, err = columnExists(ctx, db, "flows", "group_alerts_identifier")
	if err != nil {
		return fmt.Errorf("failed to check if group_alerts_identifier column exists: %v", err)
	}
	if exists {
		_, err := db.NewDropColumn().
			Table("flows").
			Column("group_alerts_identifier").
			Exec(ctx)

		if err != nil {
			return fmt.Errorf("failed to remove group_alerts_identifier column from flows table: %v", err)
		}
	} else {
		log.Debug("group_alerts_identifier column already removed from flows table")
	}

	exists, err = columnExists(ctx, db, "flows", "alert_threshold")
	if err != nil {
		return fmt.Errorf("failed to check if alert_threshold column exists: %v", err)
	}
	if exists {
		_, err := db.NewDropColumn().
			Table("flows").
			Column("alert_threshold").
			Exec(ctx)

		if err != nil {
			return fmt.Errorf("failed to remove alert_threshold column from flows table: %v", err)
		}
	} else {
		log.Debug("alert_threshold column already removed from flows table")
	}

	return nil
}
