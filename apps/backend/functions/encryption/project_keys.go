package encryption

import (
	"context"
	"crypto/rand"
	"crypto/sha256"
	"encoding/hex"
	"errors"

	"golang.org/x/crypto/pbkdf2"

	"github.com/uptrace/bun"
	"github.com/JustLABv1/justflow/apps/backend/config"
	"github.com/JustLABv1/justflow/apps/backend/pkg/models"
)

// GenerateProjectSalt generates a new random salt for a project
func GenerateProjectSalt() (string, error) {
	salt := make([]byte, 32) // 256-bit salt
	_, err := rand.Read(salt)
	if err != nil {
		return "", err
	}
	return hex.EncodeToString(salt), nil
}

// DeriveProjectEncryptionKey derives an encryption key from master secret + project salt
func DeriveProjectEncryptionKey(projectSalt string, masterSecret string) ([]byte, error) {
	if masterSecret == "" {
		return nil, errors.New("master secret not configured")
	}

	saltBytes, err := hex.DecodeString(projectSalt)
	if err != nil {
		return nil, err
	}

	// Use PBKDF2 to derive a 32-byte key from master secret + project salt
	// 100,000 iterations should be sufficient for this use case
	key := pbkdf2.Key([]byte(masterSecret), saltBytes, 100000, 32, sha256.New)
	return key, nil
}

// GetProjectEncryptionKey retrieves the encryption key for a specific project
func GetProjectEncryptionKey(projectID string, db *bun.DB) ([]byte, error) {
	var project models.Projects
	err := db.NewSelect().Model(&project).Where("id = ?", projectID).Scan(context.Background())
	if err != nil {
		return nil, err
	}

	if !project.EncryptionEnabled {
		return nil, errors.New("encryption is disabled for this project")
	}

	if project.EncryptionKey == "" {
		return nil, errors.New("encryption salt not found for project")
	}

	// Derive the actual encryption key from master secret + project salt
	masterSecret := config.Config.Encryption.MasterSecret
	if masterSecret == "" {
		// Fall back to legacy key storage if master secret not configured
		keyBytes, err := hex.DecodeString(project.EncryptionKey)
		if err != nil {
			return nil, err
		}
		return keyBytes, nil
	}

	return DeriveProjectEncryptionKey(project.EncryptionKey, masterSecret)
}

// SetProjectEncryptionSalt sets the encryption salt for a specific project
func SetProjectEncryptionSalt(projectID string, encryptionSalt string, db *bun.DB) error {
	_, err := db.NewUpdate().
		Model((*models.Projects)(nil)).
		Set("encryption_key = ?, encryption_enabled = ?", encryptionSalt, true).
		Where("id = ?", projectID).
		Exec(context.Background())

	return err
}

// EnableProjectEncryption enables encryption for a project and generates a new salt if one doesn't exist
func EnableProjectEncryption(projectID string, db *bun.DB) error {
	var project models.Projects
	err := db.NewSelect().Model(&project).Where("id = ?", projectID).Scan(context.Background())
	if err != nil {
		return err
	}

	// Generate a new salt if one doesn't exist
	if project.EncryptionKey == "" {
		newSalt, err := GenerateProjectSalt()
		if err != nil {
			return err
		}

		_, err = db.NewUpdate().
			Model((*models.Projects)(nil)).
			Set("encryption_key = ?, encryption_enabled = ?", newSalt, true).
			Where("id = ?", projectID).
			Exec(context.Background())

		return err
	}

	// Just enable encryption if salt already exists
	_, err = db.NewUpdate().
		Model((*models.Projects)(nil)).
		Set("encryption_enabled = ?", true).
		Where("id = ?", projectID).
		Exec(context.Background())

	return err
}

// DisableProjectEncryption disables encryption for a project (but keeps the salt)
func DisableProjectEncryption(projectID string, db *bun.DB) error {
	_, err := db.NewUpdate().
		Model((*models.Projects)(nil)).
		Set("encryption_enabled = ?", false).
		Where("id = ?", projectID).
		Exec(context.Background())

	return err
}

// RotateProjectEncryptionKey generates a new encryption salt for a project
func RotateProjectEncryptionKey(projectID string, db *bun.DB) (string, error) {
	newSalt, err := GenerateProjectSalt()
	if err != nil {
		return "", err
	}

	_, err = db.NewUpdate().
		Model((*models.Projects)(nil)).
		Set("encryption_key = ?", newSalt).
		Where("id = ?", projectID).
		Exec(context.Background())

	if err != nil {
		return "", err
	}

	return newSalt, nil
}
