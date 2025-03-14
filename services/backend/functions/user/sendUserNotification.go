package functions

import (
	"github.com/v1Flows/exFlow/services/backend/pkg/models"
	"context"

	_ "github.com/lib/pq"
	"github.com/uptrace/bun"
)

func SendUserNotification(userID string, title string, body string, icon string, color string, link string, linxText string, db *bun.DB) error {
	ctx := context.Background()

	notification := models.Notifications{
		UserID:   userID,
		Title:    title,
		Body:     body,
		Icon:     icon,
		Color:    color,
		Link:     link,
		LinkText: linxText,
	}
	_, err := db.NewInsert().Model(&notification).Exec(ctx)
	if err != nil {
		return err
	}

	return nil
}
