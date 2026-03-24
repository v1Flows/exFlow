package token

import (
	"crypto/hmac"
	"crypto/rand"
	"crypto/sha256"
	"encoding/hex"
	"fmt"
	"strings"
	"sync"
	"time"
)

var (
	secretStore struct {
		secret string
		token  string
		mu     sync.RWMutex
	}
)

// GenerateToken creates a secure token with HMAC
func GenerateToken() string {
	timestamp := time.Now().Unix()
	message := fmt.Sprintf("%d", timestamp)

	secret, err := generateSecureSecret(32)
	if err != nil {
		panic(err)
	}

	h := hmac.New(sha256.New, []byte(secret))
	h.Write([]byte(message))
	signature := hex.EncodeToString(h.Sum(nil))

	// Store the secret and token
	storeSecretAndToken(secret, fmt.Sprintf("%s:%s", message, signature))

	return fmt.Sprintf("%s:%s", message, signature)
}

// ValidateToken checks if the token is valid
func ValidateToken(token string) bool {
	parts := strings.Split(token, ":")
	if len(parts) != 2 {
		return false
	}

	// Retrieve the secret
	secret, _ := getSecretAndToken()

	message, signature := parts[0], parts[1]
	h := hmac.New(sha256.New, []byte(secret))
	h.Write([]byte(message))
	expectedSignature := hex.EncodeToString(h.Sum(nil))

	return hmac.Equal([]byte(signature), []byte(expectedSignature))
}

func generateSecureSecret(length int) (string, error) {
	bytes := make([]byte, length)
	_, err := rand.Read(bytes)
	if err != nil {
		return "", err
	}
	return hex.EncodeToString(bytes), nil
}

func storeSecretAndToken(secret, token string) {
	secretStore.mu.Lock()
	defer secretStore.mu.Unlock()
	secretStore.secret = secret
	secretStore.token = token
}

func getSecretAndToken() (string, string) {
	secretStore.mu.RLock()
	defer secretStore.mu.RUnlock()
	return secretStore.secret, secretStore.token
}
