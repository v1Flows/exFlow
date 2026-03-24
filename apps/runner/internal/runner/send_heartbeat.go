package runner

import (
	"io"
	"net/http"
	"time"

	"github.com/JustLABv1/runner/pkg/platform"

	log "github.com/sirupsen/logrus"
)

const (
	heartbeatInterval      = 10 * time.Second
	heartbeatRetryDelay    = 5 * time.Second
	heartbeatMaxRetries    = 3
	heartbeatMaxFailures   = 30 // ~5 minutes of consecutive failures before giving up
)

func SendHeartbeat() {
	client := http.Client{
		Timeout: 10 * time.Second,
		Transport: &http.Transport{
			DisableKeepAlives: true,
		},
	}

	url, apiKey, runnerID := platform.GetPlatformConfig(nil)

	parsedUrl := url + "/api/v1/runners/" + runnerID + "/heartbeat"

	ticker := time.NewTicker(heartbeatInterval)
	defer ticker.Stop()

	consecutiveFailures := 0

	for range ticker.C {
		success := false

		for i := 0; i < heartbeatMaxRetries; i++ {
			req, err := http.NewRequest("PUT", parsedUrl, nil)
			if err != nil {
				log.Errorf("Failed to create heartbeat request: %v", err)
				time.Sleep(heartbeatRetryDelay)
				continue
			}
			req.Header.Set("Authorization", apiKey)

			resp, err := client.Do(req)
			if err != nil {
				log.Errorf("Failed to send heartbeat (attempt %d/%d): %v", i+1, heartbeatMaxRetries, err)
				time.Sleep(heartbeatRetryDelay)
				continue
			}

			body, err := io.ReadAll(resp.Body)
			resp.Body.Close()
			if err != nil {
				log.Errorf("Failed to read heartbeat response body: %v", err)
				continue
			}

			if resp.StatusCode == 200 {
				log.Debug("Heartbeat sent")
				success = true
				break
			}

			log.Errorf("Heartbeat rejected by backend (attempt %d/%d), status %d: %s", i+1, heartbeatMaxRetries, resp.StatusCode, body)
			time.Sleep(heartbeatRetryDelay)
		}

		if success {
			consecutiveFailures = 0
		} else {
			consecutiveFailures++
			log.Errorf("Heartbeat failed after %d attempts (%d consecutive failures)", heartbeatMaxRetries, consecutiveFailures)

			if consecutiveFailures >= heartbeatMaxFailures {
				log.Fatalf("Runner lost connection to backend after %d consecutive heartbeat failures (~%s). Shutting down.",
					consecutiveFailures, time.Duration(consecutiveFailures)*heartbeatInterval)
			}
		}
	}
}
