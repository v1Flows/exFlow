package background_checks

import (
	"time"

	"github.com/uptrace/bun"
)

func Init(db *bun.DB) {
	ticker := time.NewTicker(5 * time.Minute)
	quit := make(chan struct{})

	go func() {
		for {
			select {
			case <-ticker.C:
				checkHangingExecutions(db)
				checkDisconnectedAutoRunners(db)
			case <-quit:
				ticker.Stop()
				return
			}
		}
	}()
}
