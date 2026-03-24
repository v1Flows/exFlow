package migrations

import (
	"context"
	"crypto/rand"
	"encoding/hex"

	"github.com/uptrace/bun"
)

func init() {
	Migrations.MustRegister(func(ctx context.Context, db *bun.DB) error {
		// Add encryption_key column to projects table
		_, err := db.ExecContext(ctx, "ALTER TABLE projects ADD COLUMN IF NOT EXISTS encryption_key TEXT DEFAULT ''")
		if err != nil {
			return err
		}

		// Add encryption_enabled column to projects table
		_, err = db.ExecContext(ctx, "ALTER TABLE projects ADD COLUMN IF NOT EXISTS encryption_enabled BOOLEAN DEFAULT true")
		if err != nil {
			return err
		}

		// Generate encryption salts for existing projects that don't have them
		rows, err := db.QueryContext(ctx, "SELECT id FROM projects WHERE encryption_key = '' OR encryption_key IS NULL")
		if err != nil {
			return err
		}
		defer rows.Close()

		for rows.Next() {
			var projectID string
			if err := rows.Scan(&projectID); err != nil {
				continue // Skip problematic rows, don't fail the entire migration
			}

			// Generate a new 32-byte salt (not a key!)
			salt := make([]byte, 32)
			if _, err := rand.Read(salt); err != nil {
				continue // Skip if salt generation fails
			}
			hexSalt := hex.EncodeToString(salt)

			// Update the project with the new encryption salt
			_, err = db.ExecContext(ctx, "UPDATE projects SET encryption_key = $1, encryption_enabled = true WHERE id = $2", hexSalt, projectID)
			if err != nil {
				continue // Skip if update fails
			}
		}

		return nil
	}, func(ctx context.Context, db *bun.DB) error {
		// Drop the added columns
		_, err := db.ExecContext(ctx, "ALTER TABLE projects DROP COLUMN IF EXISTS encryption_key")
		if err != nil {
			return err
		}

		_, err = db.ExecContext(ctx, "ALTER TABLE projects DROP COLUMN IF EXISTS encryption_enabled")
		if err != nil {
			return err
		}

		return nil
	})
}
