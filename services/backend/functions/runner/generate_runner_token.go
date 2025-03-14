package functions_runner

import (
	"github.com/v1Flows/exFlow/services/backend/functions/auth"
	"github.com/v1Flows/exFlow/services/backend/pkg/models"
	"context"
	"time"

	"github.com/google/uuid"
	"github.com/uptrace/bun"
)

func GenerateRunnerToken(projectID string, runnerID string, db *bun.DB) (token string, err error) {
	var key models.Tokens

	key.ID = uuid.New()
	key.CreatedAt = time.Now()
	key.ProjectID = projectID
	key.Type = "runner"
	key.Description = "Token for runner " + runnerID

	key.Key, key.ExpiresAt, err = auth.GenerateRunnerJWT(runnerID, projectID, key.ID)
	if err != nil {
		return "", err
	}

	_, err = db.NewInsert().Model(&key).Exec(context.Background())
	if err != nil {
		return "", err
	}

	return key.Key, nil
}
