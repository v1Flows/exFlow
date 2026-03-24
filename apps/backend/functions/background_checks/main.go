package background_checks

import (
	"time"

	"github.com/JustLABv1/justflow/apps/backend/pkg/telemetry"
	"github.com/uptrace/bun"
)

func Init(db *bun.DB) {
	ticker := time.NewTicker(1 * time.Minute)
	ticker2 := time.NewTicker(10 * time.Second)
	quit := make(chan struct{})

	go func() {
		for {
			select {
			case <-ticker.C:
				runCheck("checkHangingExecutions", func() { checkHangingExecutions(db) })
				runCheck("checkHangingExecutionSteps", func() { checkHangingExecutionSteps(db) })
				runCheck("checkDisconnectedAutoRunners", func() { checkDisconnectedAutoRunners(db) })
				runCheck("checkForFlowActionUpdates", func() { checkForFlowActionUpdates(db) })
				runCheck("scheduleFlowExecutions", func() { scheduleFlowExecutions(db) })
			case <-quit:
				ticker.Stop()
				return
			}
		}
	}()

	go func() {
		for {
			select {
			case <-ticker2.C:
				runCheck("checkScheduledExecutions", func() { checkScheduledExecutions(db) })
			case <-quit:
				ticker2.Stop()
				return
			}
		}
	}()
}

func runCheck(name string, check func()) {
	start := time.Now()
	check()
	duration := time.Since(start).Seconds()
	telemetry.BackgroundCheckDurationSeconds.WithLabelValues(name).Observe(duration)
}
