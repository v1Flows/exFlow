package encryption

import (
	"context"
	"crypto/aes"
	"crypto/cipher"
	"crypto/rand"
	"encoding/hex"
	"encoding/json"
	"errors"
	"fmt"
	"io"

	"github.com/uptrace/bun"
	"github.com/JustLABv1/justflow/apps/backend/config"
	"github.com/JustLABv1/justflow/apps/backend/pkg/models"
)

// getEncryptionKey returns the appropriate encryption key for a project
// Falls back to global config key if project encryption is disabled or key is missing
func getEncryptionKey(projectID string, db *bun.DB) ([]byte, error) {
	if projectID == "" {
		// Fall back to global config if no project ID provided
		return []byte(config.Config.Encryption.Key), nil
	}

	var project models.Projects
	err := db.NewSelect().Model(&project).Where("id = ?", projectID).Scan(context.Background())
	if err != nil {
		// Fall back to global config if project not found
		return []byte(config.Config.Encryption.Key), nil
	}

	// Use project-specific encryption if enabled and salt exists
	if project.EncryptionEnabled && project.EncryptionKey != "" {
		// Try to derive key from master secret + salt
		masterSecret := config.Config.Encryption.MasterSecret
		if masterSecret != "" {
			keyBytes, err := DeriveProjectEncryptionKey(project.EncryptionKey, masterSecret)
			if err != nil {
				// Fall back to global config if key derivation fails
				return []byte(config.Config.Encryption.Key), nil
			}
			return keyBytes, nil
		}

		// Legacy: treat stored value as actual key (for backward compatibility)
		keyBytes, err := hex.DecodeString(project.EncryptionKey)
		if err != nil {
			// Fall back to global config if key decode fails
			return []byte(config.Config.Encryption.Key), nil
		}
		return keyBytes, nil
	}

	// Fall back to global config
	return []byte(config.Config.Encryption.Key), nil
}

// EncryptParamsWithProject encrypts action params using project-specific encryption
func EncryptParamsWithProject(actions []models.Action, projectID string, db *bun.DB) ([]models.Action, error) {
	encryptionKey, err := getEncryptionKey(projectID, db)
	if err != nil {
		return nil, err
	}

	block, err := aes.NewCipher(encryptionKey)
	if err != nil {
		return nil, err
	}

	gcm, err := cipher.NewGCM(block)
	if err != nil {
		return nil, err
	}

	for i, action := range actions {
		for j, param := range action.Params {
			// Skip encryption if the value is empty
			if param.Value == "" {
				continue
			}

			// if param is a password and is encrypted, skip encryption
			if param.Type == "password" && IsEncrypted(param.Value) {
				continue
			}

			// Convert the param value to JSON
			jsonValue, err := json.Marshal(param.Value)
			if err != nil {
				return nil, err
			}

			// Generate a nonce for GCM
			nonce := make([]byte, gcm.NonceSize())
			if _, err := io.ReadFull(rand.Reader, nonce); err != nil {
				return nil, err
			}

			// Encrypt the JSON value
			ciphertext := gcm.Seal(nonce, nonce, jsonValue, nil)

			param.Value = hex.EncodeToString(ciphertext)
			actions[i].Params[j] = param
		}

		// if action has an updated action, encrypt the params of the updated action
		if action.UpdatedAction != nil {
			for j, param := range action.UpdatedAction.Params {
				// Skip encryption if the value is empty
				if param.Value == "" {
					continue
				}

				// if param is a password and is encrypted, skip encryption
				if param.Type == "password" && IsEncrypted(param.Value) {
					continue
				}

				// don't encrypt if the value is already encrypted
				if IsEncrypted(param.Value) {
					continue
				}

				// Convert the param value to JSON
				jsonValue, err := json.Marshal(param.Value)
				if err != nil {
					return nil, err
				}

				// Generate a nonce for GCM
				nonce := make([]byte, gcm.NonceSize())
				if _, err := io.ReadFull(rand.Reader, nonce); err != nil {
					return nil, err
				}

				// Encrypt the JSON value
				ciphertext := gcm.Seal(nonce, nonce, jsonValue, nil)

				param.Value = hex.EncodeToString(ciphertext)
				action.UpdatedAction.Params[j] = param
			}
		}
	}

	return actions, nil
}

// DecryptParamsWithProject decrypts action params using project-specific encryption
func DecryptParamsWithProject(actions []models.Action, projectID string, decryptPasswords bool, db *bun.DB) ([]models.Action, error) {
	encryptionKey, err := getEncryptionKey(projectID, db)
	if err != nil {
		return nil, err
	}

	block, err := aes.NewCipher(encryptionKey)
	if err != nil {
		return nil, err
	}

	gcm, err := cipher.NewGCM(block)
	if err != nil {
		return nil, err
	}

	for i, action := range actions {
		for j, param := range action.Params {
			// Skip decryption if the value is empty
			if param.Value == "" {
				continue
			}

			if param.Type == "password" && !decryptPasswords {
				continue
			}

			// Skip decryption if the value is not encrypted
			if !IsEncrypted(param.Value) {
				continue
			}

			// Decode the hex string
			ciphertext, err := hex.DecodeString(param.Value)
			if err != nil {
				return nil, errors.New("failed to decode hex string: " + err.Error())
			}

			if len(ciphertext) < gcm.NonceSize() {
				return nil, errors.New("ciphertext too short")
			}

			// Extract the nonce and ciphertext
			nonce := ciphertext[:gcm.NonceSize()]
			ciphertext = ciphertext[gcm.NonceSize():]

			// Decrypt the ciphertext
			plaintext, err := gcm.Open(nil, nonce, ciphertext, nil)
			if err != nil {
				return nil, errors.New("failed to decrypt: " + err.Error())
			}

			// Convert the decrypted JSON value back to the original type
			var originalValue interface{}
			if err := json.Unmarshal(plaintext, &originalValue); err != nil {
				return nil, err
			}

			param.Value = fmt.Sprintf("%v", originalValue)
			actions[i].Params[j] = param
		}

		// if action has an updated action, decrypt the params of the updated action
		if action.UpdatedAction != nil {
			for j, param := range action.UpdatedAction.Params {
				// skip if value is not encrypted
				if !IsEncrypted(param.Value) {
					continue
				}

				// Skip decryption if the value is empty
				if param.Value == "" {
					continue
				}

				if param.Type == "password" && !decryptPasswords {
					continue
				}

				// Decode the hex string
				ciphertext, err := hex.DecodeString(param.Value)
				if err != nil {
					return nil, errors.New("failed to decode hex string: " + err.Error())
				}

				if len(ciphertext) < gcm.NonceSize() {
					return nil, errors.New("ciphertext too short")
				}

				// Extract the nonce and ciphertext
				nonce := ciphertext[:gcm.NonceSize()]
				ciphertext = ciphertext[gcm.NonceSize():]

				// Decrypt the ciphertext
				plaintext, err := gcm.Open(nil, nonce, ciphertext, nil)
				if err != nil {
					return nil, errors.New("failed to decrypt: " + err.Error())
				}

				// Convert the decrypted JSON value back to the original type
				var originalValue interface{}
				if err := json.Unmarshal(plaintext, &originalValue); err != nil {
					return nil, err
				}

				param.Value = fmt.Sprintf("%v", originalValue)
				action.UpdatedAction.Params[j] = param
			}
		}
	}

	return actions, nil
}

// EncryptParamWithProject encrypts a single param using project-specific encryption
func EncryptParamWithProject(param models.Params, projectID string, db *bun.DB) (models.Params, error) {
	encryptionKey, err := getEncryptionKey(projectID, db)
	if err != nil {
		return param, err
	}

	block, err := aes.NewCipher(encryptionKey)
	if err != nil {
		return param, err
	}

	gcm, err := cipher.NewGCM(block)
	if err != nil {
		return param, err
	}

	// Skip encryption if the value is empty
	if param.Value == "" {
		return param, nil
	}

	// if param is a password and is encrypted, skip encryption
	if param.Type == "password" && IsEncrypted(param.Value) {
		return param, nil
	}

	// Convert the param value to JSON
	jsonValue, err := json.Marshal(param.Value)
	if err != nil {
		return param, err
	}

	// Generate a nonce for GCM
	nonce := make([]byte, gcm.NonceSize())
	if _, err := io.ReadFull(rand.Reader, nonce); err != nil {
		return param, err
	}

	// Encrypt the JSON value
	ciphertext := gcm.Seal(nonce, nonce, jsonValue, nil)

	param.Value = hex.EncodeToString(ciphertext)

	return param, nil
}

// DecryptStringWithProject decrypts a string using project-specific encryption
func DecryptStringWithProject(value string, projectID string, db *bun.DB) (string, error) {
	encryptionKey, err := getEncryptionKey(projectID, db)
	if err != nil {
		return "", err
	}

	block, err := aes.NewCipher(encryptionKey)
	if err != nil {
		return "", err
	}

	gcm, err := cipher.NewGCM(block)
	if err != nil {
		return "", err
	}

	// Decode the hex string
	ciphertext, err := hex.DecodeString(value)
	if err != nil {
		return "", errors.New("failed to decode hex string: " + err.Error())
	}

	if len(ciphertext) < gcm.NonceSize() {
		return "", errors.New("ciphertext too short")
	}

	// Extract the nonce and ciphertext
	nonce := ciphertext[:gcm.NonceSize()]
	ciphertext = ciphertext[gcm.NonceSize():]

	// Decrypt the ciphertext
	plaintext, err := gcm.Open(nil, nonce, ciphertext, nil)
	if err != nil {
		return "", errors.New("failed to decrypt: " + err.Error())
	}

	return string(plaintext), nil
}

func IsEncrypted(value string) bool {
	decoded, err := hex.DecodeString(value)
	if err != nil {
		return false
	}

	// GCM nonce size is 12 bytes for standard GCM
	nonceSize := 12
	return len(decoded) > nonceSize
}
