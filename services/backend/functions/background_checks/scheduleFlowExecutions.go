package background_checks

import (
	"context"
	"database/sql"
	"time"

	"github.com/google/uuid"
	log "github.com/sirupsen/logrus"
	"github.com/uptrace/bun"
	"github.com/v1Flows/exFlow/services/backend/functions/encryption"
	"github.com/v1Flows/exFlow/services/backend/pkg/models"
	shared_models "github.com/v1Flows/shared-library/pkg/models"
)

func scheduleFlowExecutions(db *bun.DB) {
	context := context.Background()

	log.Info("Bot: Plan executions for flows with scheduling enabled...")

	// get all executions that reached the scheduled time
	var flows []models.Flows
	err := db.NewSelect().Model(&flows).Where("schedule_every_value != 0 and schedule_every_unit != ''").Scan(context)
	if err != nil {
		log.Error("Bot: Error getting flows. ", err)
	}

	// schedule new executions for each flow based on the schedule
	for _, flow := range flows {
		// get all executions for that flow that are triggered by schedule
		var lastScheduledExecution []models.Executions
		count, err := db.NewSelect().
			Model(&lastScheduledExecution).
			Where("flow_id = ? AND triggered_by = 'schedule' AND (status = 'pending' OR status = 'scheduled')", flow.ID.String()).
			Order("scheduled_at DESC").
			ScanAndCount(context)
		if err != nil && err != sql.ErrNoRows {
			log.Error("Bot: Error getting executions for flow. ", err)
		}

		if count > 1 {
			// There is already a pending or scheduled execution, skip scheduling a new one
			continue
		}

		var currentTime time.Time
		if count == 0 {
			currentTime = time.Now()
			returnedExecutionTime := createExecution(currentTime, flow, db, context)

			// directly schedule the next execution
			createExecution(returnedExecutionTime, flow, db, context)

		} else {
			currentTime = lastScheduledExecution[0].ScheduledAt
			if currentTime.IsZero() {
				currentTime = time.Now()
			}

			createExecution(currentTime, flow, db, context)
		}

	}
}

func createExecution(currentTime time.Time, flow models.Flows, db *bun.DB, context context.Context) (scheduledAt time.Time) {
	// calculate the next execution time
	var nextExecutionTime time.Time
	switch flow.ScheduleEveryUnit {
	case "minutes":
		nextExecutionTime = currentTime.Add(time.Duration(flow.ScheduleEveryValue) * time.Minute)
	case "hours":
		nextExecutionTime = currentTime.Add(time.Duration(flow.ScheduleEveryValue) * time.Hour)
	case "days":
		nextExecutionTime = currentTime.Add(time.Duration(flow.ScheduleEveryValue) * time.Hour * 24)
	case "weeks":
		nextExecutionTime = currentTime.Add(time.Duration(flow.ScheduleEveryValue) * time.Hour * 24 * 7)
	}

	// create new execution
	var execution models.Executions
	execution.ID = uuid.New()
	execution.CreatedAt = time.Now()
	execution.Status = "scheduled"
	execution.TriggeredBy = "schedule"
	execution.ScheduledAt = nextExecutionTime
	execution.FlowID = flow.ID.String()
	_, err := db.NewInsert().Model(&execution).Exec(context)
	if err != nil {
		log.Error("Bot: Error creating execution on db. ", err)
		return
	}

	// create execution step which tells that the execution is registerd and waiting for runner to pick it up
	step := shared_models.ExecutionSteps{
		ExecutionID: execution.ID.String(),
		Action: shared_models.Action{
			Name: "Scheduled",
			Icon: "hugeicons:time-schedule",
		},
		Messages: []shared_models.Message{
			{
				Title: "Scheduled",
				Lines: []shared_models.Line{
					{
						Content:   "Execution is registered and is waiting for the scheduled time to start",
						Timestamp: time.Now(),
					},
					{
						Content:   "Scheduled time: " + execution.ScheduledAt.Format(time.RFC3339),
						Timestamp: time.Now(),
					},
				},
			},
		},
		Status:    "paused",
		CreatedAt: time.Now(),
		StartedAt: time.Now(),
	}

	// check for encryption
	if flow.EncryptExecutions && step.Messages != nil && len(step.Messages) > 0 {
		step.Messages, err = encryption.EncryptExecutionStepActionMessage(step.Messages)
		if err != nil {
			log.Error("Bot: Error encrypting execution step action messages. ", err)
			return
		}

		step.Encrypted = true
	}

	_, err = db.NewInsert().Model(&step).Exec(context)
	if err != nil {
		log.Error("Bot: Error adding error step", err)
		return
	}

	return nextExecutionTime
}
