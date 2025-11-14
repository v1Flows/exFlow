package encryption

import (
	"crypto/aes"
	"crypto/cipher"
	"crypto/rand"
	"encoding/hex"
	"encoding/json"
	"errors"
	"io"

	"github.com/uptrace/bun"
)

func EncryptPayload(payload json.RawMessage, projectID string, db *bun.DB) (json.RawMessage, error) {
	// Validate that the input payload is valid JSON
	var validationInterface interface{}
	if err := json.Unmarshal(payload, &validationInterface); err != nil {
		return nil, errors.New("input payload is not valid JSON: " + err.Error())
	}

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

	// Generate a nonce for GCM
	nonce := make([]byte, gcm.NonceSize())
	if _, err := io.ReadFull(rand.Reader, nonce); err != nil {
		return nil, err
	}

	// Encrypt the JSON value
	ciphertext := gcm.Seal(nonce, nonce, payload, nil)

	// Encode the ciphertext as hex to make it safe for database storage
	hexEncoded := hex.EncodeToString(ciphertext)

	return json.RawMessage(`"` + hexEncoded + `"`), nil
}

func DecryptPayload(payload json.RawMessage, projectID string, db *bun.DB) (json.RawMessage, error) {
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

	// Decode the hex string from JSON string format
	var hexString string
	if err := json.Unmarshal(payload, &hexString); err != nil {
		return nil, errors.New("failed to unmarshal JSON string: " + err.Error())
	}

	ciphertext, err := hex.DecodeString(hexString)
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

	// Validate that the decrypted data is valid JSON
	var validationInterface interface{}
	if err := json.Unmarshal(plaintext, &validationInterface); err != nil {
		return nil, errors.New("decrypted payload is not valid JSON: " + err.Error())
	}

	return json.RawMessage(plaintext), nil
}
