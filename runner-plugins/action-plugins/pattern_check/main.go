package main

import (
	"context"
	"encoding/json"
	"errors"
	"net/rpc"
	"strings"
	"sync"
	"time"

	"github.com/JustLABv1/runner/pkg/executions"
	"github.com/JustLABv1/runner/pkg/plugins"
	"github.com/tidwall/gjson"

	"github.com/JustLABv1/justflow/pkg/contracts"

	"github.com/hashicorp/go-plugin"
)

type Receiver struct {
	Receiver string `json:"receiver"`
}

type IncomingFlow struct {
	Flow models.Flows `json:"flow"`
}

// Plugin is an implementation of the Plugin interface
type Plugin struct{}

var (
	taskCancels   = make(map[string]context.CancelFunc)
	taskCancelsMu sync.Mutex
)

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

	// Check for cancellation before each major step
	if ctx.Err() != nil {
		err := executions.UpdateStep(request.Config, request.Execution.ID.String(), models.ExecutionSteps{
			ID: request.Step.ID,
			Messages: []models.Message{
				{
					Title: "Cancel",
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

	err := executions.UpdateStep(request.Config, request.Execution.ID.String(), models.ExecutionSteps{
		ID: request.Step.ID,
		Messages: []models.Message{
			{
				Title: "Pattern Check",
				Lines: []models.Line{
					{
						Content:   "Checking patterns",
						Timestamp: time.Now(),
					},
				},
			},
		},
		Status:    "running",
		StartedAt: time.Now(),
	})
	if err != nil {
		return plugins.Response{}, err
	}

	// end if there are no patterns
	if len(request.Flow.Patterns) == 0 {
		err = executions.UpdateStep(request.Config, request.Execution.ID.String(), models.ExecutionSteps{
			ID: request.Step.ID,
			Messages: []models.Message{
				{
					Title: "Pattern Check",
					Lines: []models.Line{
						{
							Content:   "No patterns are defined",
							Timestamp: time.Now(),
						},
						{
							Content:   "Continue to next step",
							Color:     "success",
							Timestamp: time.Now(),
						},
					},
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
			Success: true,
		}, nil
	}

	// convert payload to string
	payloadBytes, err := json.Marshal(request.Alert.Payload)
	if err != nil {
		return plugins.Response{
			Success: false,
		}, err
	}
	payloadString := string(payloadBytes)

	patternMissMatched := 0

	for _, pattern := range request.Flow.Patterns {
		value := gjson.Get(payloadString, pattern.Key)

		if pattern.Type == "equals" {
			if value.String() == pattern.Value {
				err := executions.UpdateStep(request.Config, request.Execution.ID.String(), models.ExecutionSteps{
					ID: request.Step.ID,
					Messages: []models.Message{
						{
							Title: "Pattern Check",
							Lines: []models.Line{
								{
									Content:   `Pattern: ` + pattern.Key + ` == ` + pattern.Value + ` matched`,
									Color:     "success",
									Timestamp: time.Now(),
								},
								{
									Content:   "Continue to next step",
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
			} else {
				err = executions.UpdateStep(request.Config, request.Execution.ID.String(), models.ExecutionSteps{
					ID: request.Step.ID,
					Messages: []models.Message{
						{
							Title: "Pattern Check",
							Lines: []models.Line{
								{
									Content:   `Pattern: ` + pattern.Key + ` == ` + pattern.Value + ` not found`,
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
				patternMissMatched++
			}
		} else if pattern.Type == "not_equals" {
			if value.String() != pattern.Value {
				err := executions.UpdateStep(request.Config, request.Execution.ID.String(), models.ExecutionSteps{
					ID: request.Step.ID,
					Messages: []models.Message{
						{
							Title: "Pattern Check",
							Lines: []models.Line{
								{
									Content:   `Pattern: ` + pattern.Key + ` != ` + pattern.Value + ` not found`,
									Color:     "success",
									Timestamp: time.Now(),
								},
								{
									Content:   "Continue to next step",
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
			} else {
				err = executions.UpdateStep(request.Config, request.Execution.ID.String(), models.ExecutionSteps{
					ID: request.Step.ID,
					Messages: []models.Message{
						{
							Title: "Pattern Check",
							Lines: []models.Line{
								{
									Content:   `Pattern: ` + pattern.Key + ` != ` + pattern.Value + ` matched`,
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
				patternMissMatched++
			}
		} else if pattern.Type == "contains" {
			if !strings.Contains(value.String(), pattern.Value) {
				err := executions.UpdateStep(request.Config, request.Execution.ID.String(), models.ExecutionSteps{
					ID: request.Step.ID,
					Messages: []models.Message{
						{
							Title: "Pattern Check",
							Lines: []models.Line{
								{
									Content:   `Pattern: ` + pattern.Key + ` contains ` + pattern.Value + ` not found`,
									Color:     "success",
									Timestamp: time.Now(),
								},
								{
									Content:   "Continue to next step",
									Color:     "success",
									Timestamp: time.Now(),
								},
							},
						},
					},
				})
				if err != nil {
					return plugins.Response{}, err
				}
			} else {
				err = executions.UpdateStep(request.Config, request.Execution.ID.String(), models.ExecutionSteps{
					ID: request.Step.ID,
					Messages: []models.Message{
						{
							Title: "Pattern Check",
							Lines: []models.Line{
								{
									Content:   `Pattern: ` + pattern.Key + ` contains ` + pattern.Value + ` matched`,
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
				patternMissMatched++
			}
		} else if pattern.Type == "not_contains" {
			if strings.Contains(value.String(), pattern.Value) {
				err := executions.UpdateStep(request.Config, request.Execution.ID.String(), models.ExecutionSteps{
					ID: request.Step.ID,
					Messages: []models.Message{
						{
							Title: "Pattern Check",
							Lines: []models.Line{
								{
									Content:   `Pattern: ` + pattern.Key + ` not contains ` + pattern.Value + ` not found`,
									Color:     "success",
									Timestamp: time.Now(),
								},
								{
									Content:   "Continue to next step",
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
			} else {
				err = executions.UpdateStep(request.Config, request.Execution.ID.String(), models.ExecutionSteps{
					ID: request.Step.ID,
					Messages: []models.Message{
						{
							Title: "Pattern Check",
							Lines: []models.Line{
								{
									Content:   `Pattern: ` + pattern.Key + ` not contains ` + pattern.Value + ` matched`,
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
				patternMissMatched++
			}
		}
	}

	if patternMissMatched > 0 {
		err = executions.UpdateStep(request.Config, request.Execution.ID.String(), models.ExecutionSteps{
			ID: request.Step.ID,
			Messages: []models.Message{
				{
					Title: "Pattern Check",
					Lines: []models.Line{
						{
							Content:   "Some patterns did not match",
							Color:     "danger",
							Timestamp: time.Now(),
						},
						{
							Content:   "Cancel execution",
							Color:     "danger",
							Timestamp: time.Now(),
						},
					},
				},
			},
			Status:     "noPatternMatch",
			FinishedAt: time.Now(),
		})
		if err != nil {
			return plugins.Response{
				Success: false,
			}, err
		}
		return plugins.Response{
			Data: map[string]interface{}{
				"status": "noPatternMatch",
			},
			Success: false,
		}, nil
	} else {
		err = executions.UpdateStep(request.Config, request.Execution.ID.String(), models.ExecutionSteps{
			ID: request.Step.ID,
			Messages: []models.Message{
				{
					Title: "Pattern Check",
					Lines: []models.Line{
						{
							Content:   "All patterns matched",
							Color:     "success",
							Timestamp: time.Now(),
						},
						{
							Content:   "Continue to next step",
							Color:     "success",
							Timestamp: time.Now(),
						},
					},
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
			Success: true,
		}, nil
	}
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
		Name:    "Pattern Check",
		Type:    "action",
		Version: "1.5.0-beta.3",
		Author:  "JustNZ",
		Action: models.Action{
			Name:        "Pattern Check",
			Description: "Check flow patterns",
			Plugin:      "pattern_check",
			Icon:        "solar:list-check-minimalistic-bold",
			Category:    "Utility",
			Params:      nil,
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
