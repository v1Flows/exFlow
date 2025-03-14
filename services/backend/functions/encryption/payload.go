package encryption

import (
	"github.com/v1Flows/exFlow/services/backend/config"
	"crypto/aes"
	"crypto/cipher"
	"crypto/rand"
	"encoding/base64"
	"encoding/json"
	"io"
)

func EncryptPayload(payload json.RawMessage) (json.RawMessage, error) {
	block, err := aes.NewCipher([]byte(config.Config.Encryption.Key))
	if err != nil {
		return nil, err
	}

	plaintext := []byte(payload)
	ciphertext := make([]byte, aes.BlockSize+len(plaintext))
	iv := ciphertext[:aes.BlockSize]

	if _, err := io.ReadFull(rand.Reader, iv); err != nil {
		return nil, err
	}

	stream := cipher.NewCFBEncrypter(block, iv)
	stream.XORKeyStream(ciphertext[aes.BlockSize:], plaintext)

	// Encode the ciphertext as base64 to ensure it can be stored as JSON
	encodedCiphertext := base64.StdEncoding.EncodeToString(ciphertext)
	encryptedPayload, err := json.Marshal(encodedCiphertext)
	if err != nil {
		return nil, err
	}

	return json.RawMessage(encryptedPayload), nil
}

func DecryptPayload(payload json.RawMessage) (json.RawMessage, error) {
	block, err := aes.NewCipher([]byte(config.Config.Encryption.Key))
	if err != nil {
		return nil, err
	}

	var encodedCiphertext string
	if err := json.Unmarshal(payload, &encodedCiphertext); err != nil {
		return nil, err
	}

	ciphertext, err := base64.StdEncoding.DecodeString(encodedCiphertext)
	if err != nil {
		return nil, err
	}

	iv := ciphertext[:aes.BlockSize]
	ciphertext = ciphertext[aes.BlockSize:]

	stream := cipher.NewCFBDecrypter(block, iv)
	stream.XORKeyStream(ciphertext, ciphertext)

	return json.RawMessage(ciphertext), nil
}
