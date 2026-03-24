package runner

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"net"
	"net/http"
	"strconv"
	"time"

	"github.com/JustLABv1/justflow/pkg/contracts"
	"github.com/JustLABv1/runner/config"
	"github.com/JustLABv1/runner/internal/token"
	"github.com/JustLABv1/runner/pkg/platform"
	"github.com/google/uuid"

	log "github.com/sirupsen/logrus"
)

func RegisterAtAPI(version string, plugins []models.Plugin, actions []models.Action, alertEndpoints []models.Endpoint) {
	configManager := config.GetInstance()
	cfg := configManager.GetConfig()

	url, apiKey, runnerID := platform.GetPlatformConfig(nil)

	if apiKey == "" {
		apiKey = cfg.Runner.SharedRunnerSecret
	}

	var parsedRunnerID uuid.UUID
	var err error
	if runnerID != "" {
		parsedRunnerID, err = uuid.Parse(runnerID)
		if err != nil {
			log.Fatalf("Invalid RunnerID: %v", err)
		}
	}

	ip, err := GetLocalIPv4()
	if err != nil {
		log.Fatalf("Failed to get local IPv4 address: %v", err)
	}

	// generate an random token for ApiToken
	token := token.GenerateToken()

	register := models.Runners{
		ID:            parsedRunnerID,
		Registered:    true,
		LastHeartbeat: time.Now(),
		Version:       version,
		Mode:          cfg.Mode,
		Plugins:       plugins,
		Actions:       actions,
		Endpoints:     alertEndpoints,
		ApiURL:        "http://" + ip + ":" + strconv.Itoa(cfg.ApiEndpoint.Port) + "/api/v1",
		ApiToken:      token,
	}

	payloadBuf := new(bytes.Buffer)
	json.NewEncoder(payloadBuf).Encode(register)
	req, err := http.NewRequest("PUT", url+"/api/v1/runners/register", payloadBuf)
	if err != nil {
		log.Fatal(err)
	}
	req.Header.Set("Authorization", apiKey)

	for i := 0; i < 3; i++ {
		resp, err := http.DefaultClient.Do(req)
		if err != nil {
			log.Errorf("Failed to send request: %v", err)
			time.Sleep(5 * time.Second) // Add delay before retrying
			continue
		}

		body, err := io.ReadAll(resp.Body)
		resp.Body.Close() // Close the body after reading
		if err != nil {
			log.Errorf("Failed to read response body: %v", err)
			time.Sleep(5 * time.Second) // Add delay before retrying
			continue
		}

		if resp.StatusCode == 201 {
			var response struct {
				RunnerID string `json:"runner_id"`
				Token    string `json:"token"`
			}
			if err := json.Unmarshal(body, &response); err != nil {
				log.Fatal(err)
			}

			runner_id := ""
			if response.RunnerID == "" {
				runner_id = configManager.GetRunnerID()
			} else {
				runner_id = response.RunnerID
			}

			if response.Token != "" {
				configManager.UpdateRunnerApiKey(response.Token)
			}
			configManager.UpdateRunnerID(runner_id)

			log.Info("Runner registered. ID: ", configManager.GetRunnerID())
			return
		} else {
			log.Errorf("Failed to register, attempt %d", i+1)
			log.Errorf("Response: %s", string(body))
			time.Sleep(5 * time.Second) // Add delay before retrying
		}
	}
	log.Fatal("Failed to register after 3 attempts")
}

func GetLocalIPv4() (string, error) {
	interfaces, err := net.Interfaces()
	if err != nil {
		return "", fmt.Errorf("failed to get network interfaces: %v", err)
	}

	for _, iface := range interfaces {
		// Skip interfaces that are down or not loopback
		if iface.Flags&net.FlagUp == 0 || iface.Flags&net.FlagLoopback != 0 {
			continue
		}

		addrs, err := iface.Addrs()
		if err != nil {
			return "", fmt.Errorf("failed to get addresses for interface %s: %v", iface.Name, err)
		}

		for _, addr := range addrs {
			var ip net.IP

			switch v := addr.(type) {
			case *net.IPNet:
				ip = v.IP
			case *net.IPAddr:
				ip = v.IP
			}

			// Check if it's an IPv4 address
			if ip != nil && ip.To4() != nil {
				return ip.String(), nil
			}
		}
	}

	return "", fmt.Errorf("no IPv4 address found")
}
