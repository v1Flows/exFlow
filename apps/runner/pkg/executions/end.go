package executions

import (
	"bytes"
	"encoding/json"
	"net/http"
	"time"

	"github.com/JustLABv1/justflow/pkg/contracts"
	"github.com/JustLABv1/runner/config"
	"github.com/JustLABv1/runner/internal/runner"
	"github.com/JustLABv1/runner/pkg/platform"

	log "github.com/sirupsen/logrus"
)

func EndCanceled(cfg *config.Config, execution models.Executions) {
	execution.FinishedAt = time.Now()
	execution.Status = "canceled"
	End(cfg, execution)
}

func EndNoPatternMatch(cfg *config.Config, execution models.Executions) {
	execution.FinishedAt = time.Now()
	execution.Status = "noPatternMatch"
	End(cfg, execution)
}

func EndWithError(cfg *config.Config, execution models.Executions) {
	execution.FinishedAt = time.Now()
	execution.Status = "error"
	End(cfg, execution)
}

func EndWithRecovered(cfg *config.Config, execution models.Executions) {
	execution.FinishedAt = time.Now()
	execution.Status = "recovered"
	End(cfg, execution)
}

func EndSuccess(cfg *config.Config, execution models.Executions) {
	execution.Status = "success"
	execution.FinishedAt = time.Now()
	End(cfg, execution)
}

func End(cfg *config.Config, execution models.Executions) {
	url, apiKey := platform.GetPlatformConfigPlain(cfg)

	runner.Busy(false)

	payloadBuf := new(bytes.Buffer)
	json.NewEncoder(payloadBuf).Encode(execution)

	req, err := http.NewRequest("PUT", url+"/api/v1/executions/"+execution.ID.String(), payloadBuf)
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
		log.Error("Failed to update execution")
	}
}
