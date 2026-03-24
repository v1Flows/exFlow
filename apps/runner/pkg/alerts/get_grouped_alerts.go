package alerts

import (
	"bytes"
	"encoding/json"
	"fmt"
	"net/http"
	"time"

	"github.com/JustLABv1/justflow/pkg/contracts"
	"github.com/JustLABv1/runner/config"
	internal_models "github.com/JustLABv1/runner/pkg/models"

	log "github.com/sirupsen/logrus"
)

func GetGroupedAlerts(cfg *config.Config, flowID string, groupKeyIdentifier string) ([]models.Alerts, error) {
	client := http.Client{
		Timeout: 10 * time.Second,
		Transport: &http.Transport{
			DisableKeepAlives: true,
		},
	}

	request := models.IncomingGroupedAlertsRequest{
		FlowID:                flowID,
		GroupAlertsIdentifier: groupKeyIdentifier,
	}

	payloadBuf := new(bytes.Buffer)
	json.NewEncoder(payloadBuf).Encode(request)

	url := cfg.JustFlow.URL + "/api/v1/alerts/grouped"
	req, err := http.NewRequest("GET", url, payloadBuf)
	if err != nil {
		log.Errorf("Failed to create request: %v", err)
		return []models.Alerts{}, err
	}
	req.Header.Set("Authorization", cfg.JustFlow.APIKey)
	resp, err := client.Do(req)
	if err != nil {
		log.Error(err)
		return []models.Alerts{}, err
	}

	if resp.StatusCode != 200 {
		log.Errorf("Failed to get alerts from API: %s", url)
		err = fmt.Errorf("failed to get alerts from API: %s", url)
		return []models.Alerts{}, err
	}

	log.Debugf("Alerts received from API: %s", url)

	var alerts internal_models.IncomingAlerts
	err = json.NewDecoder(resp.Body).Decode(&alerts)
	if err != nil {
		log.Fatal(err)
		return []models.Alerts{}, err
	}

	return alerts.Alerts, nil
}
