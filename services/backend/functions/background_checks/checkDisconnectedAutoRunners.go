package background_checks

import (
	"context"
	"fmt"

	"github.com/v1Flows/exFlow/services/backend/pkg/models"

	log "github.com/sirupsen/logrus"
	"github.com/uptrace/bun"
)

func checkDisconnectedAutoRunners(db *bun.DB) {
	context := context.Background()

	log.Info("Bot: Checking for disconnected runners")

	// get all executions that are not finished
	var runners []models.Runners
	err := db.NewSelect().Model(&runners).Where("last_heartbeat < NOW() - INTERVAL '5 minutes'").Scan(context)
	if err != nil {
		log.Error("Bot: Error getting running runners. ", err)
	}

	for _, runner := range runners {
		log.Info(fmt.Sprintf("Bot: Runner %s seems to be not connected anymore. Removing it", runner.ID))
		_, err := db.NewDelete().Model(&runner).Where("id = ?", runner.ID).Exec(context)
		if err != nil {
			log.Error(fmt.Sprintf("Bot: Error removing runner %s. ", runner.ID), err)
		}
	}
}
