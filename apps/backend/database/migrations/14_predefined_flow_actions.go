package migrations

import (
	"context"
	"fmt"

	log "github.com/sirupsen/logrus"
	"github.com/uptrace/bun"
)

func init() {
	Migrations.MustRegister(func(ctx context.Context, db *bun.DB) error {
		return addPredefinedFlowActionsColToProjects(ctx, db)
	}, func(ctx context.Context, db *bun.DB) error {
		return removePredefinedFlowActionsColFromProjects(ctx, db)
	})
}

func addPredefinedFlowActionsColToProjects(ctx context.Context, db *bun.DB) error {
	// add predefined_flow_actions column
	exists, err := columnExists(ctx, db, "projects", "predefined_flow_actions")
	if err != nil {
		return fmt.Errorf("failed to check if predefined_flow_actions column exists: %v", err)
	}
	if !exists {
		_, err := db.NewAddColumn().
			Table("projects").
			ColumnExpr("predefined_flow_actions JSONB DEFAULT jsonb('[]')").
			Exec(ctx)

		if err != nil {
			return fmt.Errorf("failed to add predefined_flow_actions column to projects table: %v", err)
		}
	} else {
		log.Debug("predefined_flow_actions column already exists in projects table")
	}

	return nil
}

func removePredefinedFlowActionsColFromProjects(ctx context.Context, db *bun.DB) error {
	exists, err := columnExists(ctx, db, "projects", "predefined_flow_actions")
	if err != nil {
		return fmt.Errorf("failed to check if predefined_flow_actions column exists: %v", err)
	}
	if exists {
		_, err := db.NewDropColumn().
			Table("projects").
			Column("predefined_flow_actions").
			Exec(ctx)

		if err != nil {
			return fmt.Errorf("failed to remove predefined_flow_actions column from projects table: %v", err)
		}
	} else {
		log.Debug("predefined_flow_actions column already removed from projects table")
	}

	return nil
}
