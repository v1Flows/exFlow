package auth

import (
	"github.com/v1Flows/exFlow/services/backend/pkg/models"
	"time"

	"github.com/golang-jwt/jwt/v5"
	"github.com/google/uuid"
)

func GenerateProjectAutoRunnerJWT(projectID string, id uuid.UUID) (tokenString string, expirationTime time.Time, err error) {
	expirationTime = time.Now().Add(50 * 365 * 24 * time.Hour) // 10 years
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
