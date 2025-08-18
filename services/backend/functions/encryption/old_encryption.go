package encryption

import (
	"crypto/aes"
	"crypto/cipher"
	"encoding/base64"
	"encoding/hex"
	"encoding/json"
	"errors"
	"fmt"

	"github.com/v1Flows/exFlow/services/backend/config"
	shared_models "github.com/v1Flows/shared-library/pkg/models"
)

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
