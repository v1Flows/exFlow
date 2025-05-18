package auth

import (
	"time"

	"github.com/v1Flows/exFlow/services/backend/config"
	"github.com/v1Flows/exFlow/services/backend/pkg/models"

	"github.com/golang-jwt/jwt/v5"
	"github.com/google/uuid"
)

func GenerateProjectJWT(projectID string, days int, id uuid.UUID) (tokenString string, expirationTime time.Time, err error) {
	var jwtKey = []byte(config.Config.JWT.Secret)

	// Set expiration time by adding days to current time
	expirationTime = time.Now().AddDate(0, 0, days)
	claims := &models.JWTProjectClaim{
		ProjectID: projectID,
		ID:        id,
		Type:      "project",
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(expirationTime),
		},
	}
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	tokenString, err = token.SignedString(jwtKey)
	return
}
