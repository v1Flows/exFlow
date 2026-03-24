package executions

import (
	"encoding/json"
	"fmt"
	"net/http"
	"time"

	"github.com/JustLABv1/justflow/pkg/contracts"
	"github.com/JustLABv1/runner/config"
	internal_models "github.com/JustLABv1/runner/pkg/models"
	"github.com/JustLABv1/runner/pkg/platform"

	log "github.com/sirupsen/logrus"
)

func GetExecutionByID(cfg *config.Config, executionID string) (models.Executions, error) {
	client := http.Client{
		Timeout: 10 * time.Second,
		Transport: &http.Transport{
			DisableKeepAlives: true,
		},
	}

	url, apiKey := platform.GetPlatformConfigPlain(cfg)

	parsedUrl := url + "/api/v1/executions/" + executionID
	req, err := http.NewRequest("GET", parsedUrl, nil)
	if err != nil {
		log.Errorf("Failed to create request: %v", err)
		return models.Executions{}, err
	}
	req.Header.Set("Authorization", apiKey)
	resp, err := client.Do(req)
	if err != nil {
		log.Error(err)
		return models.Executions{}, err
	}

	if resp.StatusCode != 200 {
		log.Errorf("Failed to get execution data from API: %s", url)
		err = fmt.Errorf("failed to get execution data from API: %s", url)
		return models.Executions{}, err
	}

	var execution internal_models.IncomingExecution
	err = json.NewDecoder(resp.Body).Decode(&execution)
	if err != nil {
		log.Fatal(err)
		return models.Executions{}, err
	}

	return execution.ExecutionData, nil
}
