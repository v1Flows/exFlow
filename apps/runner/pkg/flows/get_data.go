package flows

import (
	"fmt"
	"io"
	"net/http"
	"time"

	"github.com/JustLABv1/runner/config"
	"github.com/JustLABv1/runner/pkg/platform"

	log "github.com/sirupsen/logrus"
)

func GetFlowData(cfg *config.Config, flowID string) (bytes []byte, err error) {
	client := http.Client{
		Timeout: 10 * time.Second,
		Transport: &http.Transport{
			DisableKeepAlives: true,
		},
	}

	url, apiKey := platform.GetPlatformConfigPlain(cfg)

	parsedUrl := url + "/api/v1/flows/" + flowID
	req, err := http.NewRequest("GET", parsedUrl, nil)
	if err != nil {
		log.Errorf("Failed to create request: %v", err)
		return nil, err
	}
	req.Header.Set("Authorization", apiKey)
	resp, err := client.Do(req)
	if err != nil {
		log.Error(err)
		return nil, err
	}

	if resp.StatusCode != 200 {
		log.Errorf("Failed to get flow data from API: %s", url)
		err = fmt.Errorf("failed to get flow data from API: %s", url)
		return nil, err
	}

	log.Debugf("Flow data received from API: %s", url)

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		log.Fatal(err)
		return nil, err
	}

	return body, nil
}
