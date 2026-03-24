package executions

import (
	"bytes"
	"encoding/json"
	"net/http"

	"github.com/JustLABv1/justflow/pkg/contracts"
	"github.com/JustLABv1/runner/config"
	"github.com/JustLABv1/runner/pkg/platform"

	log "github.com/sirupsen/logrus"
)

func UpdateStep(cfg *config.Config, executionID string, step models.ExecutionSteps) error {
	payloadBuf := new(bytes.Buffer)
	json.NewEncoder(payloadBuf).Encode(step)

	url, apiKey := platform.GetPlatformConfigPlain(cfg)

	req, err := http.NewRequest("PUT", url+"/api/v1/executions/"+executionID+"/steps/"+step.ID.String(), payloadBuf)
	if err != nil {
		log.Error(err)
		return err
	}
	req.Header.Set("Authorization", apiKey)
	resp, err := http.DefaultClient.Do(req)
	if err != nil {
		log.Error(err)
		return err
	}
	defer resp.Body.Close()
	if resp.StatusCode != 200 {
		log.Error("Failed to send execution step")
		return err
	}

	return nil
}
