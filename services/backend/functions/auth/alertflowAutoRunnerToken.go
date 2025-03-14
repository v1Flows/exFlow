package auth

import (
	"time"

	"github.com/v1Flows/exFlow/services/backend/pkg/models"

	"github.com/golang-jwt/jwt/v5"
	"github.com/google/uuid"
)

func GenerateExFlowAutoRunnerJWT(id uuid.UUID) (tokenString string, expirationTime time.Time, err error) {
	expirationTime = time.Now().Add(50 * 365 * 24 * time.Hour) // 10 years
	claims := &models.JWTProjectRunnerClaim{
		ProjectID: "admin",
		ID:        id,
		Type:      "exflow_auto_runner",
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(expirationTime),
		},
	}
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	tokenString, err = token.SignedString(jwtKey)
	return
}
