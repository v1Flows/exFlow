package background_checks

import (
	"time"

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
				checkHangingExecutions(db)
				checkDisconnectedAutoRunners(db)
				checkForFlowActionUpdates(db)
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
				checkScheduledExecutions(db)
			case <-quit:
				ticker2.Stop()
				return
			}
		}
	}()
}
