package internal_executions

import (
	"time"

	"github.com/JustLABv1/justflow/pkg/contracts"
	"github.com/JustLABv1/runner/pkg/executions"
	log "github.com/sirupsen/logrus"
)

func cancelRemainingSteps(executionID string) error {
	steps, err := executions.GetSteps(nil, executionID)
	if err != nil {
		log.Error(err)
		return err
	}

	// cancel each step where pending is true
	for _, step := range steps {
		if step.Status == "pending" {
			step.Status = "canceled"
			step.CanceledBy = "Runner"
			step.CanceledAt = time.Now()
			step.Messages = []models.Message{
				{
					Title: "Canceled",
					Lines: []models.Line{
						{
							Content:   "Canceled by runner due to previous step failure/interaction/timeout",
							Color:     "danger",
							Timestamp: time.Now(),
						},
					},
				},
			}
			step.StartedAt = time.Now()
			step.FinishedAt = time.Now()

			err := executions.UpdateStep(nil, executionID, step)
			if err != nil {
				log.Error(err)
				return err
			}
		}
	}

	return nil
}
