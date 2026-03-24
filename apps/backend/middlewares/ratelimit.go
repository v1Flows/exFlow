package middlewares

import (
	"errors"
	"sync"
	"time"

	"github.com/JustLABv1/justflow/apps/backend/functions/httperror"
	"github.com/gin-gonic/gin"
)

// runnerRateLimiter tracks the last accepted request time per runner ID.
type runnerRateLimiter struct {
	mu       sync.Mutex
	lastSeen map[string]time.Time
	min      time.Duration
}

func newRunnerRateLimiter(minInterval time.Duration) *runnerRateLimiter {
	rl := &runnerRateLimiter{
		lastSeen: make(map[string]time.Time),
		min:      minInterval,
	}
	// Periodically clean up stale entries to prevent unbounded memory growth
	go func() {
		ticker := time.NewTicker(10 * time.Minute)
		defer ticker.Stop()
		for range ticker.C {
			rl.mu.Lock()
			cutoff := time.Now().Add(-30 * time.Minute)
			for k, t := range rl.lastSeen {
				if t.Before(cutoff) {
					delete(rl.lastSeen, k)
				}
			}
			rl.mu.Unlock()
		}
	}()
	return rl
}

func (rl *runnerRateLimiter) Allow(key string) bool {
	rl.mu.Lock()
	defer rl.mu.Unlock()
	last, exists := rl.lastSeen[key]
	if exists && time.Since(last) < rl.min {
		return false
	}
	rl.lastSeen[key] = time.Now()
	return true
}

// Global rate limiters (one per endpoint type)
var (
	heartbeatLimiter = newRunnerRateLimiter(5 * time.Second)
	busyLimiter      = newRunnerRateLimiter(1 * time.Second)
)

// RunnerHeartbeatRateLimit allows at most one heartbeat request per runner every 5 seconds.
func RunnerHeartbeatRateLimit() gin.HandlerFunc {
	return func(c *gin.Context) {
		runnerID := c.Param("runnerID")
		if runnerID == "" {
			c.Next()
			return
		}
		if !heartbeatLimiter.Allow(runnerID) {
			httperror.StatusConflict(c, "Heartbeat rate limit exceeded — minimum interval is 5s", errors.New("heartbeat rate limit exceeded"))
			return
		}
		c.Next()
	}
}

// RunnerBusyRateLimit allows at most one busy request per runner per second.
func RunnerBusyRateLimit() gin.HandlerFunc {
	return func(c *gin.Context) {
		runnerID := c.Param("runnerID")
		if runnerID == "" {
			c.Next()
			return
		}
		if !busyLimiter.Allow(runnerID) {
			httperror.StatusConflict(c, "Busy rate limit exceeded — minimum interval is 1s", errors.New("busy rate limit exceeded"))
			return
		}
		c.Next()
	}
}
