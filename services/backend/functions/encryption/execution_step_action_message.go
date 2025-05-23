package encryption

import (
	"crypto/aes"
	"crypto/cipher"
	"crypto/rand"
	"encoding/base64"
	"errors"
	"io"

	"github.com/v1Flows/exFlow/services/backend/config"
	shared_models "github.com/v1Flows/shared-library/pkg/models"
)

func EncryptExecutionStepActionMessage(messages []shared_models.Message) ([]shared_models.Message, error) {
	block, err := aes.NewCipher([]byte(config.Config.Encryption.Key))
	if err != nil {
		return nil, err
	}

	gcm, err := cipher.NewGCM(block)
	if err != nil {
		return nil, err
	}

	for i := range messages {
		for line := range messages[i].Lines {
			plaintext := []byte(messages[i].Lines[line].Content)
			nonce := make([]byte, gcm.NonceSize())

			if _, err := io.ReadFull(rand.Reader, nonce); err != nil {
				return nil, err
			}

			ciphertext := gcm.Seal(nonce, nonce, plaintext, nil)

			// Encode the ciphertext as base64 to ensure it can be stored as JSON
			encodedCiphertext := base64.StdEncoding.EncodeToString(ciphertext)
			messages[i].Lines[line].Content = encodedCiphertext
		}
	}

	return messages, nil
}

func DecryptExecutionStepActionMessage(encryptedMessage []shared_models.Message) ([]shared_models.Message, error) {
	block, err := aes.NewCipher([]byte(config.Config.Encryption.Key))
	if err != nil {
		return nil, err
	}

	gcm, err := cipher.NewGCM(block)
	if err != nil {
		return nil, err
	}

	for i := range encryptedMessage {
		for line := range encryptedMessage[i].Lines {
			encodedCiphertext := encryptedMessage[i].Lines[line].Content
			ciphertext, err := base64.StdEncoding.DecodeString(encodedCiphertext)
			if err != nil {
				return nil, err
			}

			nonceSize := gcm.NonceSize()
			if len(ciphertext) < nonceSize {
				return nil, errors.New("ciphertext too short")
			}

			nonce, ciphertext := ciphertext[:nonceSize], ciphertext[nonceSize:]
			plaintext, err := gcm.Open(nil, nonce, ciphertext, nil)
			if err != nil {
				return nil, err
			}

			encryptedMessage[i].Lines[line].Content = string(plaintext)
		}
	}

	return encryptedMessage, nil
}
