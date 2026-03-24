package executions

import (
	"net/http"

	"github.com/JustLABv1/justflow/pkg/contracts"
	"github.com/JustLABv1/runner/config"
	"github.com/JustLABv1/runner/pkg/platform"

	log "github.com/sirupsen/logrus"
)

func SendHeartbeat(cfg *config.Config, execution models.Executions) {
	url, apiKey := platform.GetPlatformConfigPlain(cfg)

	req, err := http.NewRequest("PUT", url+"/api/v1/executions/"+execution.ID.String()+"/heartbeat", nil)
	if err != nil {
		log.Error(err)
	}
	req.Header.Set("Authorization", apiKey)
	resp, err := http.DefaultClient.Do(req)
	if err != nil {
		log.Error(err)
	}
	defer resp.Body.Close()
	if resp.StatusCode != 200 {
		log.Error("Failed to send execution heatbeat")
	}
}
