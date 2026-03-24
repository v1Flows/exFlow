package runner

import (
	"bytes"
	"encoding/json"
	"io"
	"net/http"

	"github.com/JustLABv1/justflow/pkg/contracts"
	"github.com/JustLABv1/runner/pkg/platform"

	log "github.com/sirupsen/logrus"
)

func Busy(busy bool) {
	payload := models.Runners{
		ExecutingJob: busy,
	}

	url, apiKey, runnerID := platform.GetPlatformConfig(nil)

	payloadBuf := new(bytes.Buffer)
	json.NewEncoder(payloadBuf).Encode(payload)
	req, err := http.NewRequest("PUT", url+"/api/v1/runners/"+runnerID+"/busy", payloadBuf)
	if err != nil {
		log.Fatal(err)
	}
	req.Header.Set("Authorization", apiKey)
	resp, err := http.DefaultClient.Do(req)
	if err != nil {
		log.Fatal(err)
	}
	defer resp.Body.Close()

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		log.Fatal(err)
	}

	if resp.StatusCode != 201 {
		log.Errorf("Failed to set runner to busy")
		log.Error("Response: ", string(body))
	}
}
