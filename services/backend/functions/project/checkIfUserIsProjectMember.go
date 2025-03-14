package functions_project

import (
	"github.com/v1Flows/exFlow/services/backend/pkg/models"
	"context"

	"github.com/uptrace/bun"
)

func CheckIfUserIsProjectMember(email string, projectID string, db *bun.DB) (bool, error) {
	ctx := context.Background()
	user := new(models.Users)
	err := db.NewSelect().Model(user).Where("email = ?", email).Scan(ctx)
	if err != nil {
		return false, err
	}

	var members []models.ProjectMembers
	count, err := db.NewSelect().Model(&members).Where("project_id = ?", projectID).Where("user_id = ?", user.ID).ScanAndCount(ctx)
	if err != nil {
		return false, err
	}

	if count > 0 {
		return true, nil
	}
	return false, nil
}
