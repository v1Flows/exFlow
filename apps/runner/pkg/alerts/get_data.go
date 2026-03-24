package alerts

import (
	"encoding/json"
	"fmt"
	"net/http"
	"time"

	"github.com/JustLABv1/justflow/pkg/contracts"
	"github.com/JustLABv1/runner/config"
	internal_models "github.com/JustLABv1/runner/pkg/models"

	log "github.com/sirupsen/logrus"
)

func GetData(cfg *config.Config, alertID string) (models.Alerts, error) {

	client := http.Client{
		Timeout: 10 * time.Second,
		Transport: &http.Transport{
			DisableKeepAlives: true,
		},
	}

	url := cfg.JustFlow.URL + "/api/v1/alerts/" + alertID
	req, err := http.NewRequest("GET", url, nil)
	if err != nil {
		log.Errorf("Failed to create request: %v", err)
		return models.Alerts{}, err
	}
	req.Header.Set("Authorization", cfg.JustFlow.APIKey)
	resp, err := client.Do(req)
	if err != nil {
		log.Error(err)
		return models.Alerts{}, err
	}

	if resp.StatusCode != 200 {
		log.Errorf("Failed to get alert from API: %s", url)
		err = fmt.Errorf("failed to get alert from API: %s", url)
		return models.Alerts{}, err
	}

	log.Debugf("Alert data received from API: %s", url)

	var alert internal_models.IncomingAlert
	err = json.NewDecoder(resp.Body).Decode(&alert)
	if err != nil {
		log.Fatal(err)
		return models.Alerts{}, err
	}

	return alert.AlertData, nil
}
