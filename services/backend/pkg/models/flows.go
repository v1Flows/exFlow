package models

import (
	shared_models "github.com/v1Flows/shared-library/pkg/models"
)

type Flows struct {
	shared_models.Flows

	FolderID string `bun:"folder_id,type:text,default:''" json:"folder_id"`
}
