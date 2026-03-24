package executions

import (
	"bytes"
	"encoding/json"
	"fmt"
	"net/http"

	"github.com/JustLABv1/justflow/pkg/contracts"
	"github.com/JustLABv1/runner/config"
	"github.com/JustLABv1/runner/pkg/platform"

	log "github.com/sirupsen/logrus"
)

func SendStep(cfg *config.Config, execution models.Executions, step models.ExecutionSteps) (models.ExecutionSteps, error) {
	payloadBuf := new(bytes.Buffer)
	json.NewEncoder(payloadBuf).Encode(step)

	url, apiKey := platform.GetPlatformConfigPlain(cfg)

	req, err := http.NewRequest("POST", url+"/api/v1/executions/"+execution.ID.String()+"/steps", payloadBuf)
	if err != nil {
		log.Error(err)
	}
	req.Header.Set("Authorization", apiKey)
	resp, err := http.DefaultClient.Do(req)
	if err != nil {
		log.Error(err)
	}
	defer resp.Body.Close()
	if resp.StatusCode != 201 {
		log.Error("Failed to send execution step")
		return models.ExecutionSteps{}, fmt.Errorf("failed to send execution step")
	}

	var stepResponse models.ExecutionSteps
	err = json.NewDecoder(resp.Body).Decode(&stepResponse)
	if err != nil {
		log.Error(err)
		return models.ExecutionSteps{}, err
	}

	return stepResponse, nil
}
