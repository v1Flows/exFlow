package auth

import (
	"github.com/v1Flows/exFlow/services/backend/pkg/models"
	"time"

	"github.com/golang-jwt/jwt/v5"
	"github.com/google/uuid"
)

func GenerateJWT(id uuid.UUID, rememberMe bool) (tokenString string, ExpiresAt int64, err error) {
	var expirationTime time.Time
	if rememberMe {
		expirationTime = time.Now().Add(7 * 24 * time.Hour)
	} else {
		expirationTime = time.Now().Add(12 * time.Hour)
	}

	claims := &models.JWTClaim{
		ID:   id,
		Type: "user",
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(expirationTime),
		},
	}
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	tokenString, err = token.SignedString(jwtKey)
	ExpiresAt = expirationTime.Unix()
	return
}
