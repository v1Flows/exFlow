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

func GetStep(cfg *config.Config, executionID string, stepID string) (models.ExecutionSteps, error) {
	client := http.Client{
		Timeout: 10 * time.Second,
		Transport: &http.Transport{
			DisableKeepAlives: true,
		},
	}

	url, apiKey := platform.GetPlatformConfigPlain(cfg)

	parsedUrl := url + "/api/v1/executions/" + executionID + "/steps/" + stepID
	req, err := http.NewRequest("GET", parsedUrl, nil)
	if err != nil {
		log.Errorf("Failed to create request: %v", err)
		return models.ExecutionSteps{}, err
	}
	req.Header.Set("Authorization", apiKey)
	resp, err := client.Do(req)
	if err != nil {
		log.Error(err)
		return models.ExecutionSteps{}, err
	}

	if resp.StatusCode != 200 {
		log.Errorf("Failed to get step data from API: %s", url)
		err = fmt.Errorf("failed to get step data from API: %s", url)
		return models.ExecutionSteps{}, err
	}

	log.Debugf("Step data received from API: %s", url)

	var step internal_models.IncomingExecutionStep
	err = json.NewDecoder(resp.Body).Decode(&step)
	if err != nil {
		log.Fatal(err)
		return models.ExecutionSteps{}, err
	}

	return step.StepData, nil
}
