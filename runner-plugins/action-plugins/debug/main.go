package main

import (
	"context"
	"encoding/json"
	"errors"
	"net/rpc"
	"strconv"
	"strings"
	"sync"
	"time"

	"github.com/JustLABv1/runner/pkg/executions"
	"github.com/JustLABv1/runner/pkg/plugins"

	"github.com/JustLABv1/justflow/pkg/contracts"

	"github.com/hashicorp/go-plugin"
)

type Receiver struct {
	Receiver string `json:"receiver"`
}

var (
	taskCancels   = make(map[string]context.CancelFunc)
	taskCancelsMu sync.Mutex
)

// Plugin is an implementation of the Plugin interface
type Plugin struct{}

// Helper function to add JSON lines with preserved indentation
func addJSONLines(showSensitiveInformations bool, finalMessages *[]models.Line, data interface{}, title string) error {
	// add separator
	*finalMessages = append(*finalMessages, models.Line{
		Content:   "",
		Timestamp: time.Now(),
	})
	*finalMessages = append(*finalMessages, models.Line{
		Content:   "-------------------- " + title + " --------------------",
		Timestamp: time.Now(),
		Color:     "primary",
	})
	*finalMessages = append(*finalMessages, models.Line{
		Content:   "",
		Timestamp: time.Now(),
	})

	// Redact password values before marshaling
	var redactedData interface{}
	if !showSensitiveInformations {
		redactedData = redactPasswords(data)
	} else {
		redactedData = data
	}

	// Marshal JSON with indentation
	jsonData, err := json.MarshalIndent(redactedData, "", "  ")
	if err != nil {
		return err
	}

	// Split JSON into multiple lines and preserve indentation
	lines := strings.Split(string(jsonData), "\n")
	for _, line := range lines {
		// Ensure indentation is preserved by keeping all whitespace
		*finalMessages = append(*finalMessages, models.Line{
			Content:   line,
			Timestamp: time.Now(),
		})
	}
	return nil
}

// Helper function to redact password values from data
func redactPasswords(data interface{}) interface{} {
	// Convert to JSON and back to get a generic map structure
	jsonData, err := json.Marshal(data)
	if err != nil {
		return data
	}

	var genericData interface{}
	if err := json.Unmarshal(jsonData, &genericData); err != nil {
		return data
	}

	// Recursively process the generic data
	return redactPasswordsInMap(genericData)
}

// Helper function to recursively redact passwords in map structures
func redactPasswordsInMap(data interface{}) interface{} {
	switch v := data.(type) {
	case map[string]interface{}:
		result := make(map[string]interface{})
		for key, value := range v {
			if key == "params" {
				// Handle params array
				if paramsArray, ok := value.([]interface{}); ok {
					newParams := make([]interface{}, len(paramsArray))
					for i, param := range paramsArray {
						if paramMap, ok := param.(map[string]interface{}); ok {
							newParam := make(map[string]interface{})
							for paramKey, paramValue := range paramMap {
								if paramKey == "value" && getParamType(paramMap) == "password" {
									newParam[paramKey] = "[REDACTED]"
								} else {
									newParam[paramKey] = redactPasswordsInMap(paramValue)
								}
							}
							newParams[i] = newParam
						} else {
							newParams[i] = redactPasswordsInMap(param)
						}
					}
					result[key] = newParams
				} else {
					result[key] = redactPasswordsInMap(value)
				}
			} else {
				result[key] = redactPasswordsInMap(value)
			}
		}
		return result
	case []interface{}:
		result := make([]interface{}, len(v))
		for i, item := range v {
			result[i] = redactPasswordsInMap(item)
		}
		return result
	default:
		return data
	}
}

// Helper function to get the type of a parameter
func getParamType(paramMap map[string]interface{}) string {
	if typeValue, ok := paramMap["type"]; ok {
		if typeStr, ok := typeValue.(string); ok {
			return typeStr
		}
	}
	return ""
}

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

	show_sensitive_informations := false
	flow := false
	execution := false
	step := false
	workspace := false
	alert := false

	// access action params
	for _, param := range request.Step.Action.Params {
		if param.Key == "show_sensitive_informations" {
			show_sensitive_informations, _ = strconv.ParseBool(param.Value)
		}
		if param.Key == "flow" {
			flow, _ = strconv.ParseBool(param.Value)
		}
		if param.Key == "execution" {
			execution, _ = strconv.ParseBool(param.Value)
		}
		if param.Key == "step" {
			step, _ = strconv.ParseBool(param.Value)
		}
		if param.Key == "workspace" {
			workspace, _ = strconv.ParseBool(param.Value)
		}
		if param.Key == "alert" {
			alert, _ = strconv.ParseBool(param.Value)
		}
	}

	err := executions.UpdateStep(request.Config, request.Execution.ID.String(), models.ExecutionSteps{
		ID: request.Step.ID,
		Messages: []models.Message{
			{
				Title: "Debugging",
				Lines: []models.Line{
					{
						Content:   "Start Debugging",
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
					Title: "Debugging",
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

	finalMessages := []models.Line{}

	if flow {
		err := addJSONLines(show_sensitive_informations, &finalMessages, request.Flow, "Flow")
		if err != nil {
			return plugins.Response{
				Success: false,
			}, err
		}
	}

	if execution {
		err := addJSONLines(show_sensitive_informations, &finalMessages, request.Execution, "Execution")
		if err != nil {
			return plugins.Response{
				Success: false,
			}, err
		}
	}

	if step {
		err := addJSONLines(show_sensitive_informations, &finalMessages, request.Step, "Step")
		if err != nil {
			return plugins.Response{
				Success: false,
			}, err
		}
	}

	if workspace {
		// add separator
		finalMessages = append(finalMessages, models.Line{
			Content:   "-------------------- Workspace --------------------",
			Timestamp: time.Now(),
		})

		finalMessages = append(finalMessages, models.Line{
			Content:   "Workspace: " + request.Workspace,
			Timestamp: time.Now(),
		})
	}

	if alert && request.Execution.AlertID != "" {
		err := addJSONLines(show_sensitive_informations, &finalMessages, request.Alert, "Alert")
		if err != nil {
			return plugins.Response{
				Success: false,
			}, err
		}
	}

	// Update the step with the final messages
	err = executions.UpdateStep(request.Config, request.Execution.ID.String(), models.ExecutionSteps{
		ID: request.Step.ID,
		Messages: []models.Message{
			{
				Title: "Debugging",
				Lines: finalMessages,
			},
			{
				Title: "Debugging",
				Lines: []models.Line{
					{
						Content:   "Debugging completed",
						Timestamp: time.Now(),
						Color:     "success",
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
		Name:    "Debug",
		Type:    "action",
		Version: "1.1.0-beta.3",
		Author:  "JustNZ",
		Action: models.Action{
			Name:        "Debug",
			Description: "Show informations about the Flow, Execution, Step, Platform, Workspace and (Alert).",
			Plugin:      "debug",
			Icon:        "hugeicons:bug-02",
			Category:    "Debug",
			Params: []models.Params{
				{
					Key:         "show_sensitive_informations",
					Title:       "Show Sensitive Informations",
					Type:        "boolean",
					Default:     "false",
					Required:    true,
					Description: "This will show sensitive information like password params in the output messages. !CAUTION: This can leak sensitive information.",
					Category:    "General",
				},
				{
					Key:         "flow",
					Title:       "Flow",
					Type:        "boolean",
					Default:     "true",
					Required:    false,
					Description: "Show flow data in the output messages. !CAUTION: This can leak sensitive information.",
					Category:    "General",
				},
				{
					Key:         "execution",
					Title:       "Execution",
					Type:        "boolean",
					Default:     "false",
					Required:    false,
					Description: "Show execution data in the output messages. !CAUTION: This can leak sensitive information.",
					Category:    "General",
				},
				{
					Key:         "step",
					Type:        "boolean",
					Default:     "false",
					Required:    false,
					Description: "Show step data in the output messages. !CAUTION: This can leak sensitive information.",
					Category:    "General",
				},
				{
					Key:         "workspace",
					Title:       "Workspace",
					Type:        "boolean",
					Default:     "false",
					Required:    false,
					Description: "Show workspace data in the output messages",
					Category:    "General",
				},
				{
					Key:         "alert",
					Title:       "Alert",
					Type:        "boolean",
					Default:     "false",
					Required:    false,
					Description: "Show alert data in the output messages. Only available for AlertFlow platform.",
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
