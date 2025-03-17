package functions_runner

import (
	"context"
	"time"

	"github.com/v1Flows/exFlow/services/backend/functions/auth"
	"github.com/v1Flows/exFlow/services/backend/pkg/models"

	"github.com/google/uuid"
	"github.com/uptrace/bun"
)

func GenerateExFlowAutoJoinToken(db *bun.DB) (token string, err error) {
	var key models.Tokens

	key.ID = uuid.New()
	key.CreatedAt = time.Now()
	key.ProjectID = "admin"
	key.Type = "shared_auto_runner"
	key.Description = "Token for Shared Auto Runner Join"

	key.Key, key.ExpiresAt, err = auth.GenerateExFlowAutoRunnerJWT(key.ID)
	if err != nil {
		return "", err
	}

	_, err = db.NewInsert().Model(&key).Exec(context.Background())
	if err != nil {
		return "", err
	}

	return key.Key, nil
}
