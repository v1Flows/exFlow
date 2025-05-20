package models

import (
	shared_models "github.com/v1Flows/shared-library/pkg/models"
)

type Flows struct {
	shared_models.Flows

	FolderID           string `bun:"folder_id,type:text,default:''" json:"folder_id"`
	ScheduleEveryValue int    `bun:"schedule_every_value,type:integer,default:0" json:"schedule_every_value"`
	ScheduleEveryUnit  string `bun:"schedule_every_unit,type:text,default:''" json:"schedule_every_unit"`
}
