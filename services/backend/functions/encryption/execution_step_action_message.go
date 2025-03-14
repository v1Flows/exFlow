package encryption

import (
	"github.com/v1Flows/exFlow/services/backend/config"
	"crypto/aes"
	"crypto/cipher"
	"crypto/rand"
	"encoding/base64"
	"io"
)

func EncryptExecutionStepActionMessage(messages []string) ([]string, error) {
	block, err := aes.NewCipher([]byte(config.Config.Encryption.Key))
	if err != nil {
		return nil, err
	}

	for i := range messages {
		plaintext := []byte(messages[i])
		ciphertext := make([]byte, aes.BlockSize+len(plaintext))
		iv := ciphertext[:aes.BlockSize]

		if _, err := io.ReadFull(rand.Reader, iv); err != nil {
			return nil, err
		}

		stream := cipher.NewCFBEncrypter(block, iv)
		stream.XORKeyStream(ciphertext[aes.BlockSize:], plaintext)

		// Encode the ciphertext as base64 to ensure it can be stored as JSON
		encodedCiphertext := base64.StdEncoding.EncodeToString(ciphertext)
		messages[i] = encodedCiphertext
	}

	return messages, nil
}

func DecryptExecutionStepActionMessage(encryptedMessage []string) ([]string, error) {
	block, err := aes.NewCipher([]byte(config.Config.Encryption.Key))
	if err != nil {
		return nil, err
	}

	for i := range encryptedMessage {
		encodedCiphertext := encryptedMessage[i]
		ciphertext, err := base64.StdEncoding.DecodeString(encodedCiphertext)
		if err != nil {
			return nil, err
		}

		iv := ciphertext[:aes.BlockSize]
		ciphertext = ciphertext[aes.BlockSize:]

		stream := cipher.NewCFBDecrypter(block, iv)
		stream.XORKeyStream(ciphertext, ciphertext)

		encryptedMessage[i] = string(ciphertext)
	}

	return encryptedMessage, nil
}
