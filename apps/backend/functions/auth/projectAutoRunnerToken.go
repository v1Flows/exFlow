package auth

import (
	"time"

	"github.com/JustLABv1/justflow/apps/backend/config"
	"github.com/JustLABv1/justflow/apps/backend/pkg/models"

	"github.com/golang-jwt/jwt/v5"
	"github.com/google/uuid"
)

func GenerateProjectAutoRunnerJWT(projectID string, id uuid.UUID) (tokenString string, expirationTime time.Time, err error) {
	var jwtKey = []byte(config.Config.JWT.Secret)

	expirationDays := time.Duration(config.Config.Runner.TokenExpirationDays)
	expirationTime = time.Now().Add(expirationDays * 24 * time.Hour)
	claims := &models.JWTProjectRunnerClaim{
		ProjectID: projectID,
		ID:        id,
		Type:      "project_auto_runner",
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(expirationTime),
		},
	}
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	tokenString, err = token.SignedString(jwtKey)
	return
}
