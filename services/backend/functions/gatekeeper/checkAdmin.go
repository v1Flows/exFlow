package gatekeeper

import (
	"github.com/v1Flows/exFlow/services/backend/pkg/models"
	"context"

	"github.com/google/uuid"
	_ "github.com/lib/pq"
	"github.com/uptrace/bun"
)

func CheckAdmin(userID uuid.UUID, db *bun.DB) (bool, error) {
	ctx := context.Background()
	user := new(models.Users)
	err := db.NewSelect().Model(user).Where("id = ?", userID).Scan(ctx)
	if err != nil {
		return false, err
	}

	if user.Role != "admin" {
		return false, nil
	} else {
		return true, nil
	}
}
