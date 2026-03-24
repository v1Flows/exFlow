package internal_executions

import (
	"encoding/json"
	"io"
	"net/http"
	"time"

	jf_models "github.com/JustLABv1/justflow/pkg/contracts"
	"github.com/JustLABv1/runner/pkg/platform"
	"github.com/JustLABv1/runner/pkg/plugins"

	log "github.com/sirupsen/logrus"
)

type IncomingExecutions struct {
	Executions []jf_models.Executions `json:"executions"`
}

func GetPendingExecutions(actions []jf_models.Action, loadedPlugins map[string]plugins.Plugin) {
	url, apiKey, runnerID := platform.GetPlatformConfig(nil)

	client := http.Client{
		Timeout: 10 * time.Second,
		Transport: &http.Transport{
			DisableKeepAlives: true,
		},
	}

	parsedUrl := url + "/api/v1/runners/" + runnerID + "/executions/pending"
	req, err := http.NewRequest("GET", parsedUrl, nil)
	if err != nil {
		log.Fatalf("Failed to create request: %v", err)
	}
	req.Header.Set("Authorization", apiKey)
	ticker := time.NewTicker(time.Second * 10)
	defer ticker.Stop()
	for range ticker.C {
		var resp *http.Response
		var err error
		for i := 0; i < 3; i++ {
			resp, err = client.Do(req)
			if err != nil {
				log.Errorf("Failed to send request: %v", err)
				time.Sleep(5 * time.Second) // Add delay before retrying
				continue
			}

			if resp.StatusCode != 200 {
				log.Errorf("Failed to get waiting executions from API: %s, attempt %d", parsedUrl, i+1)
				time.Sleep(5 * time.Second) // Add delay before retrying
				continue
			}

			log.Debugf("Executions received from API: %s", parsedUrl)

			body, err := io.ReadAll(resp.Body)
			if err != nil {
				log.Error(err)
				time.Sleep(5 * time.Second) // Add delay before retrying
				continue
			}
			resp.Body.Close() // Close the body after reading

			var executions IncomingExecutions
			err = json.Unmarshal(body, &executions)
			if err != nil {
				log.Error(err)
				continue
			}

			for index, execution := range executions.Executions {
				if execution.AlertID != "" {
					startProcessing(actions, loadedPlugins, executions.Executions[index], execution.AlertID)
				} else {
					startProcessing(actions, loadedPlugins, execution, "")
				}
			}

		}
		if resp.StatusCode != 200 {
			log.Fatalf("Failed to get waiting executions from API after 3 attempts: %s", parsedUrl)
		}
	}
}
