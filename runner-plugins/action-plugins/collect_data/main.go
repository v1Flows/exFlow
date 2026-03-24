package main

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"net/rpc"
	"strconv"
	"sync"
	"time"

	"github.com/JustLABv1/runner/pkg/alerts"
	"github.com/JustLABv1/runner/pkg/executions"
	"github.com/JustLABv1/runner/pkg/flows"
	"github.com/JustLABv1/runner/pkg/plugins"

	"github.com/JustLABv1/justflow/pkg/contracts"

	"github.com/hashicorp/go-plugin"
)

type Receiver struct {
	Receiver string `json:"receiver"`
}

type IncomingFlow struct {
	Flow models.Flows `json:"flow"`
}

var (
	taskCancels   = make(map[string]context.CancelFunc)
	taskCancelsMu sync.Mutex
)

// Plugin is an implementation of the Plugin interface
type Plugin struct{}

func (p *Plugin) ExecuteTask(request plugins.ExecuteTaskRequest) (plugins.Response, error) {
	ctx, cancel := context.WithCancel(context.Background())
	stepID := request.Step.ID.String()

	// Store cancel func
	taskCancelsMu.Lock()
	taskCancels[stepID] = cancel
	taskCancelsMu.Unlock()
	defer func() {
		taskCancelsMu.Lock()
		delete(taskCancels, stepID)
		taskCancelsMu.Unlock()
	}()

	flowID := ""
	logData := false

	if val, ok := request.Args["FlowID"]; ok {
		flowID = val
	}

	if val, ok := request.Args["LogData"]; ok {
		logData, _ = strconv.ParseBool(val)
	}

	if request.Step.Action.Params != nil && flowID == "" {
		for _, param := range request.Step.Action.Params {
			if param.Key == "LogData" {
				logData, _ = strconv.ParseBool(param.Value)
			}
			if param.Key == "FlowID" {
				flowID = param.Value
			}
		}
	}

	if flowID == "" {
		_ = executions.UpdateStep(request.Config, request.Execution.ID.String(), models.ExecutionSteps{
			ID: request.Step.ID,
			Messages: []models.Message{
				{
					Title: "Collecting Data",
					Lines: []models.Line{
						{
							Content:   "FlowID is required",
							Color:     "danger",
							Timestamp: time.Now(),
						},
					},
				},
			},
			Status:     "error",
			FinishedAt: time.Now(),
		})

		return plugins.Response{
			Success: false,
		}, errors.New("flowid is required")
	}

	err := executions.UpdateStep(request.Config, request.Execution.ID.String(), models.ExecutionSteps{
		ID: request.Step.ID,
		Messages: []models.Message{
			{
				Title: "Collecting Data",
				Lines: []models.Line{
					{
						Content:   "Collecting data",
						Timestamp: time.Now(),
					},
				},
			},
		},
		Status:    "running",
		StartedAt: time.Now(),
	})
	if err != nil {
		return plugins.Response{
			Success: false,
		}, err
	}

	// Check for cancellation before each major step
	if ctx.Err() != nil {
		err := executions.UpdateStep(request.Config, request.Execution.ID.String(), models.ExecutionSteps{
			ID: request.Step.ID,
			Messages: []models.Message{
				{
					Title: "Collecting Data",
					Lines: []models.Line{
						{
							Content:   "Action canceled",
							Color:     "danger",
							Timestamp: time.Now(),
						},
					},
				},
			},
			Status:     "canceled",
			FinishedAt: time.Now(),
		})
		if err != nil {
			return plugins.Response{
				Success: false,
			}, err
		}

		return plugins.Response{Success: false, Canceled: true}, nil
	}

	// Get Flow Data
	flowBytes, err := flows.GetFlowData(request.Config, flowID)
	if err != nil && flowBytes == nil {
		err := executions.UpdateStep(request.Config, request.Execution.ID.String(), models.ExecutionSteps{
			ID: request.Step.ID,
			Messages: []models.Message{
				{
					Title: "Collecting Data",
					Lines: []models.Line{
						{
							Content:   "Failed to get Flow Data",
							Color:     "danger",
							Timestamp: time.Now(),
						},
						{
							Content:   err.Error(),
							Color:     "danger",
							Timestamp: time.Now(),
						},
					},
				},
			},
			Status:     "error",
			FinishedAt: time.Now(),
		})
		if err != nil {
			return plugins.Response{
				Success: false,
			}, err
		}

		return plugins.Response{
			Success: false,
		}, err
	}

	flow := IncomingFlow{}
	err = json.Unmarshal(flowBytes, &flow)
	if err != nil {
		err := executions.UpdateStep(request.Config, request.Execution.ID.String(), models.ExecutionSteps{
			ID: request.Step.ID,
			Messages: []models.Message{
				{
					Title: "Collecting Data",
					Lines: []models.Line{
						{
							Content:   "Failed to unmarshal Flow Data",
							Color:     "danger",
							Timestamp: time.Now(),
						},
						{
							Content:   err.Error(),
							Color:     "danger",
							Timestamp: time.Now(),
						},
					},
				},
			},
			Status:     "error",
			FinishedAt: time.Now(),
		})
		if err != nil {
			return plugins.Response{
				Success: false,
			}, err
		}
	}

	err = executions.UpdateStep(request.Config, request.Execution.ID.String(), models.ExecutionSteps{
		ID: request.Step.ID,
		Messages: []models.Message{
			{
				Title: "Collecting Data",
				Lines: []models.Line{
					{
						Content:   "Flow Data collected",
						Timestamp: time.Now(),
					},
				},
			},
		},
	})
	if err != nil {
		return plugins.Response{
			Success: false,
		}, err
	}

	var alert models.Alerts
	if request.Execution.AlertID != "" {
		// Check for cancellation before each major step
		if ctx.Err() != nil {
			err := executions.UpdateStep(request.Config, request.Execution.ID.String(), models.ExecutionSteps{
				ID: request.Step.ID,
				Messages: []models.Message{
					{
						Title: "Collecting Data",
						Lines: []models.Line{
							{
								Content:   "Action canceled",
								Color:     "danger",
								Timestamp: time.Now(),
							},
						},
					},
				},
				Status:     "canceled",
				FinishedAt: time.Now(),
			})
			if err != nil {
				return plugins.Response{
					Success: false,
				}, err
			}

			return plugins.Response{Success: false, Canceled: true}, nil
		}

		// Get Alert Data
		alert, err = alerts.GetData(request.Config, request.Execution.AlertID)
		if err != nil {
			err := executions.UpdateStep(request.Config, request.Execution.ID.String(), models.ExecutionSteps{
				ID: request.Step.ID,
				Messages: []models.Message{
					{
						Title: "Collecting Data",
						Lines: []models.Line{
							{
								Content:   "Failed to get Alert Data",
								Color:     "danger",
								Timestamp: time.Now(),
							},
							{
								Content:   err.Error(),
								Color:     "danger",
								Timestamp: time.Now(),
							},
						},
					},
				},
				Status:     "error",
				FinishedAt: time.Now(),
			})
			if err != nil {
				return plugins.Response{
					Success: false,
				}, err
			}

			return plugins.Response{
				Success: false,
			}, err
		}

		err = executions.UpdateStep(request.Config, request.Execution.ID.String(), models.ExecutionSteps{
			ID: request.Step.ID,
			Messages: []models.Message{
				{
					Title: "Collecting Data",
					Lines: []models.Line{
						{
							Content:   "Alert Data collected",
							Color:     "success",
							Timestamp: time.Now(),
						},
					},
				},
			},
		})
		if err != nil {
			return plugins.Response{
				Success: false,
			}, err
		}
	}

	finalMessages := []models.Line{}

	if logData {
		finalMessages = append(finalMessages, models.Line{
			Content:   "Data collection completed",
			Color:     "success",
			Timestamp: time.Now(),
		})
		finalMessages = append(finalMessages, models.Line{
			Content:   "Flow Data:",
			Timestamp: time.Now(),
		})
		finalMessages = append(finalMessages, models.Line{
			Content:   fmt.Sprintf("%v", flow.Flow),
			Timestamp: time.Now(),
		})
		if request.Execution.AlertID != "" {
			finalMessages = append(finalMessages, models.Line{
				Content:   "Alert Data:",
				Timestamp: time.Now(),
			})
			finalMessages = append(finalMessages, models.Line{
				Content:   fmt.Sprintf("%v", alert),
				Timestamp: time.Now(),
			})
		}
	} else {
		finalMessages = append(finalMessages, models.Line{
			Content:   "Data collection completed",
			Color:     "success",
			Timestamp: time.Now(),
		})
	}

	err = executions.UpdateStep(request.Config, request.Execution.ID.String(), models.ExecutionSteps{
		ID: request.Step.ID,
		Messages: []models.Message{
			{
				Title: "Collecting Data",
				Lines: finalMessages,
			},
		},
		Status:     "success",
		FinishedAt: time.Now(),
	})
	if err != nil {
		return plugins.Response{
			Success: false,
		}, err
	}

	return plugins.Response{
		Flow:      &flow.Flow,
		FlowBytes: flowBytes,
		Alert:     &alert,
		Success:   true,
	}, nil
}

func (p *Plugin) CancelTask(request plugins.CancelTaskRequest) (plugins.Response, error) {
	stepID := request.Step.ID.String()
	taskCancelsMu.Lock()
	cancel, ok := taskCancels[stepID]
	taskCancelsMu.Unlock()

	if !ok {
		return plugins.Response{
			Success: false,
		}, errors.New("task not found")
	}

	cancel()
	return plugins.Response{Success: true}, nil
}

func (p *Plugin) EndpointRequest(request plugins.EndpointRequest) (plugins.Response, error) {
	return plugins.Response{
		Success: false,
	}, errors.New("not implemented")
}

func (p *Plugin) Info(request plugins.InfoRequest) (models.Plugin, error) {
	var plugin = models.Plugin{
		Name:    "Collect Data",
		Type:    "action",
		Version: "1.4.0-beta.3",
		Author:  "JustNZ",
		Action: models.Action{
			Name:        "Collect Data",
			Description: "Collects Flow and Alert data from AlertFlow or exFlow",
			Plugin:      "collect_data",
			Icon:        "hugeicons:package-receive",
			Category:    "Data",
			Params: []models.Params{
				{
					Key:         "LogData",
					Type:        "boolean",
					Default:     "false",
					Required:    false,
					Description: "Show collected data in the output messages",
					Category:    "General",
				},
				{
					Key:         "FlowID",
					Type:        "text",
					Default:     "00000000-0000-0000-0000-00000000",
					Required:    true,
					Description: "The Flow ID to collect data from",
					Category:    "General",
				},
			},
		},
		Endpoint: models.Endpoint{},
	}

	return plugin, nil
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
			"plugin": &PluginServer{Impl: &Plugin{}},
		},
		GRPCServer: plugin.DefaultGRPCServer,
	})
}
