package encryption

import (
	"crypto/aes"
	"crypto/cipher"
	"crypto/rand"
	"encoding/hex"
	"encoding/json"
	"errors"
	"fmt"
	"io"

	"github.com/v1Flows/exFlow/services/backend/config"
	shared_models "github.com/v1Flows/shared-library/pkg/models"
)

func IsEncrypted(value string) bool {
	// Encrypted values should be at least as long as the AES block size
	if len(value) < aes.BlockSize*2 {
		return false
	}

	_, err := hex.DecodeString(value)
	return err == nil
}

func EncryptParams(actions []shared_models.Action) ([]shared_models.Action, error) {
	block, err := aes.NewCipher([]byte(config.Config.Encryption.Key))
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
	}

	return actions, nil
}

func DecryptParams(actions []shared_models.Action, decryptPasswords bool) ([]shared_models.Action, error) {
	block, err := aes.NewCipher([]byte(config.Config.Encryption.Key))
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
	}

	return actions, nil
}
