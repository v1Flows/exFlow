package main

import (
	"context"
	"errors"
	"net/rpc"
	"strconv"
	"sync"
	"time"

	"github.com/JustLABv1/runner/pkg/executions"
	"github.com/JustLABv1/runner/pkg/plugins"
	probing "github.com/prometheus-community/pro-bing"

	"github.com/JustLABv1/justflow/pkg/contracts"

	"github.com/hashicorp/go-plugin"
)

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

	target := "www.alertflow.org"
	count := 3
	maxLostPackages := 0

	for _, param := range request.Step.Action.Params {
		if param.Key == "target" {
			target = param.Value
		}
		if param.Key == "count" {
			count, _ = strconv.Atoi(param.Value)
		}
		if param.Key == "maxLostPackages" {
			maxLostPackages, _ = strconv.Atoi(param.Value)
		}
	}

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
				Title: "Ping",
				Lines: []models.Line{
					{
						Content:   "Start Ping on target: " + target,
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

	pinger, err := probing.NewPinger(target)
	if err != nil {
		err = executions.UpdateStep(request.Config, request.Execution.ID.String(), models.ExecutionSteps{
			ID: request.Step.ID,
			Messages: []models.Message{
				{
					Title: "Ping",
					Lines: []models.Line{
						{
							Content:   "Error creating pinger",
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
	pinger.Count = count
	timeout := time.Duration(count) * time.Second
	pinger.Timeout = timeout
	err = pinger.Run()
	if err != nil {
		msg := ""
		if errors.Is(err, context.DeadlineExceeded) {
			msg = "Pinger timed out"
		} else {
			msg = "Error running pinger"
		}
		err = executions.UpdateStep(request.Config, request.Execution.ID.String(), models.ExecutionSteps{
			ID: request.Step.ID,
			Messages: []models.Message{
				{
					Title: "Ping",
					Lines: []models.Line{
						{
							Content:   msg,
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

	stats := pinger.Statistics() // get send/receive/duplicate/rtt stats
	err = executions.UpdateStep(request.Config, request.Execution.ID.String(), models.ExecutionSteps{
		ID: request.Step.ID,
		Messages: []models.Message{
			{
				Title: "Ping",
				Lines: []models.Line{
					{
						Content:   "Ping results",
						Timestamp: time.Now(),
					},
					{
						Content:   "Sent: " + strconv.Itoa(stats.PacketsSent),
						Timestamp: time.Now(),
					},
					{
						Content:   "Received: " + strconv.Itoa(stats.PacketsRecv),
						Timestamp: time.Now(),
					},
					{
						Content:   "Lost: " + strconv.Itoa(int(stats.PacketLoss)) + "%",
						Timestamp: time.Now(),
					},
					{
						Content:   "RTT min: " + stats.MinRtt.String(),
						Timestamp: time.Now(),
					},
					{
						Content:   "RTT max: " + stats.MaxRtt.String(),
						Timestamp: time.Now(),
					},
					{
						Content:   "RTT avg: " + stats.AvgRtt.String(),
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

	if stats.PacketLoss > float64(maxLostPackages) {
		err = executions.UpdateStep(request.Config, request.Execution.ID.String(), models.ExecutionSteps{
			ID: request.Step.ID,
			Messages: []models.Message{
				{
					Title: "Ping",
					Lines: []models.Line{
						{
							Content:   "Number of lost packages is greater than the maximum allowed",
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
		}, nil
	}

	err = executions.UpdateStep(request.Config, request.Execution.ID.String(), models.ExecutionSteps{
		ID: request.Step.ID,
		Messages: []models.Message{
			{
				Title: "Ping",
				Lines: []models.Line{
					{
						Content:   "Ping completed successfully",
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
		Name:    "Ping",
		Type:    "action",
		Version: "1.6.0-beta.3",
		Author:  "JustNZ",
		Action: models.Action{
			Name:        "Ping",
			Description: "Ping an remote target",
			Plugin:      "ping",
			Icon:        "hugeicons:router-01",
			Category:    "Network",
			Params: []models.Params{
				{
					Key:         "target",
					Title:       "Target",
					Type:        "text",
					Default:     "www.alertflow.org",
					Required:    true,
					Description: "The target to ping",
					Category:    "General",
				},
				{
					Key:         "count",
					Title:       "Count",
					Type:        "number",
					Default:     "3",
					Required:    false,
					Description: "Number of packages to send",
					Category:    "General",
				},
				{
					Key:         "maxLostPackages",
					Title:       "Max Lost Packages",
					Type:        "number",
					Default:     "0",
					Required:    false,
					Description: "Max lost packages to consider the ping failed",
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
