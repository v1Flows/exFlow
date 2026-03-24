// filepath: /path/to/ping-plugin/main.go
package main

import (
	"encoding/json"
	"errors"
	"fmt"
	"net/rpc"

	"github.com/JustLABv1/runner/pkg/alerts"
	"github.com/JustLABv1/runner/pkg/flows"
	"github.com/JustLABv1/runner/pkg/plugins"
	"github.com/google/uuid"

	"time"

	models "github.com/JustLABv1/justflow/pkg/contracts"

	"github.com/hashicorp/go-plugin"
	"github.com/tidwall/gjson"
)

type Payload struct {
	Receiver string `json:"receiver"`
	Status   string `json:"status"`
}

type IncomingFlow struct {
	Flow models.Flows `json:"flow"`
}

func parseTime(timeStr string) time.Time {
	parsedTime, err := time.Parse(time.RFC3339, timeStr)
	if err != nil {
		return time.Time{}
	}
	return parsedTime
}

// AlertmanagerEndpointPlugin is an implementation of the Plugin interface
type AlertmanagerEndpointPlugin struct{}

func (p *AlertmanagerEndpointPlugin) ExecuteTask(request plugins.ExecuteTaskRequest) (plugins.Response, error) {
	return plugins.Response{
		Success: false,
	}, errors.New("not implemented")
}

func (p *AlertmanagerEndpointPlugin) CancelTask(request plugins.CancelTaskRequest) (plugins.Response, error) {
	return plugins.Response{
		Success: false,
	}, errors.New("not implemented")
}

func (p *AlertmanagerEndpointPlugin) EndpointRequest(request plugins.EndpointRequest) (plugins.Response, error) {
	if request.Body == nil {
		return plugins.Response{
			Success: false,
		}, fmt.Errorf("no body found")
	}

	incPayload := request.Body
	payloadString := string(incPayload)
	payload := Payload{}
	json.Unmarshal(incPayload, &payload)

	alertData := models.Alerts{
		Payload:  incPayload,
		FlowID:   payload.Receiver,
		RunnerID: request.Config.JustFlow.RunnerID,
		Plugin:   "Alertmanager",
		Status:   payload.Status,
	}

	// search for alertname in payload
	if gjson.Get(payloadString, "commonLabels.alertname").Exists() {
		alertData.Name = gjson.Get(payloadString, "commonLabels.alertname").String()
	} else if gjson.Get(payloadString, "groupLabels.alertname").Exists() {
		alertData.Name = gjson.Get(payloadString, "groupLabels.alertname").String()
	} else {
		alertData.Name = "Unknown"
	}

	// get sub alerts
	if gjson.Get(payloadString, "alerts").Exists() {
		for _, alert := range gjson.Get(payloadString, "alerts").Array() {
			alertData.SubAlerts = append(alertData.SubAlerts, models.SubAlerts{
				ID:         uuid.New().String(),
				Name:       alert.Get("labels.alertname").String(),
				Status:     alert.Get("status").String(),
				Labels:     json.RawMessage(alert.Get("labels").Raw),
				StartedAt:  parseTime(alert.Get("startsAt").String()),
				ResolvedAt: parseTime(alert.Get("endsAt").String()),
			})
		}
	}

	// get flow data
	flowBytes, err := flows.GetFlowData(request.Config, payload.Receiver)
	if err != nil {
		return plugins.Response{
			Success: false,
		}, err
	}

	if flowBytes == nil {
		return plugins.Response{
			Success: false,
		}, fmt.Errorf("flow not found")
	}

	flow := IncomingFlow{}
	err = json.Unmarshal(flowBytes, &flow)
	if err != nil {
		return plugins.Response{
			Success: false,
		}, err
	}

	if flow.Flow.GroupAlerts {
		// check if payload matched the group key identifier
		if gjson.Get(payloadString, flow.Flow.GroupAlertsIdentifier).Exists() {
			alertData.GroupKey = flow.Flow.GroupAlertsIdentifier + "=" + gjson.Get(payloadString, flow.Flow.GroupAlertsIdentifier).String()

			// get grouped alerts
			groupedAlerts, err := alerts.GetGroupedAlerts(request.Config, payload.Receiver, alertData.GroupKey)
			if err != nil {
				return plugins.Response{
					Success: false,
				}, err
			}

			if len(groupedAlerts) > 0 {
				// get the first alert in the group
				alertData.ParentID = groupedAlerts[0].ID.String()
			}
		}
	}

	// check if alert is resolved
	err = alerts.SendAlert(request.Config, alertData)
	if err != nil {
		return plugins.Response{
			Success: false,
		}, err
	}

	return plugins.Response{
		Success: true,
	}, nil
}

func (p *AlertmanagerEndpointPlugin) Info(request plugins.InfoRequest) (models.Plugin, error) {
	return models.Plugin{
		Name:    "Alertmanager",
		Type:    "endpoint",
		Version: "1.3.0-beta.3",
		Author:  "JustNZ",
		Endpoint: models.Endpoint{
			ID:    "alertmanager",
			Name:  "Alertmanager",
			Path:  "/alertmanager",
			Icon:  "vscode-icons:file-type-prometheus",
			Color: "#e6522c",
		},
	}, nil
}

// PluginRPCServer is the RPC server for Plugin
type PluginRPCServer struct {
	Impl plugins.Plugin
}

func (s *PluginRPCServer) ExecuteTask(request plugins.ExecuteTaskRequest, resp *plugins.Response) error {
	result, err := s.Impl.ExecuteTask(request)
	*resp = result
	return err
}

func (s *PluginRPCServer) CancelTask(request plugins.CancelTaskRequest, resp *plugins.Response) error {
	result, err := s.Impl.CancelTask(request)
	*resp = result
	return err
}

func (s *PluginRPCServer) EndpointRequest(request plugins.EndpointRequest, resp *plugins.Response) error {
	result, err := s.Impl.EndpointRequest(request)
	*resp = result
	return err
}

func (s *PluginRPCServer) Info(request plugins.InfoRequest, resp *models.Plugin) error {
	result, err := s.Impl.Info(request)
	*resp = result
	return err
}

// PluginServer is the implementation of plugin.Plugin interface
type PluginServer struct {
	Impl plugins.Plugin
}

func (p *PluginServer) Server(*plugin.MuxBroker) (interface{}, error) {
	return &PluginRPCServer{Impl: p.Impl}, nil
}

func (p *PluginServer) Client(b *plugin.MuxBroker, c *rpc.Client) (interface{}, error) {
	return &plugins.PluginRPC{Client: c}, nil
}

func main() {
	plugin.Serve(&plugin.ServeConfig{
		HandshakeConfig: plugin.HandshakeConfig{
			ProtocolVersion:  1,
			MagicCookieKey:   "PLUGIN_MAGIC_COOKIE",
			MagicCookieValue: "hello",
		},
		Plugins: map[string]plugin.Plugin{
			"plugin": &PluginServer{Impl: &AlertmanagerEndpointPlugin{}},
		},
		GRPCServer: plugin.DefaultGRPCServer,
	})
}
