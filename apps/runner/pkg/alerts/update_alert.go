package alerts

import (
	"bytes"
	"encoding/json"
	"net/http"

	"github.com/JustLABv1/justflow/pkg/contracts"
	"github.com/JustLABv1/runner/config"

	log "github.com/sirupsen/logrus"
)

func UpdateAlert(cfg *config.Config, alert models.Alerts) {
	log.Info("Updating Alert")

	jsonPayload, err := json.Marshal(alert)
	if err != nil {
		log.Error(err)
		return
	}

	// Add authorization
	req, err := http.NewRequest("PUT", cfg.JustFlow.URL+"/api/v1/alerts/"+alert.ID.String(), bytes.NewReader(jsonPayload))
	if err != nil {
		log.Error(err)
		return
	}
	req.Header.Set("Authorization", cfg.JustFlow.APIKey)

	client := &http.Client{}
	res, err := client.Do(req)
	if err != nil {
		log.Error(err)
		return
	}
	defer res.Body.Close()

	if res.StatusCode != 201 {
		log.Error("Failed to update alert")
		return
	} else {
		log.Info("Alert Updated")
	}
}
