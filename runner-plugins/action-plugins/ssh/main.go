package main

import (
	"context"
	"errors"
	"net/rpc"
	"strconv"
	"strings"
	"sync"
	"time"

	"github.com/JustLABv1/runner/pkg/executions"
	"github.com/JustLABv1/runner/pkg/plugins"
	"github.com/melbahja/goph"
	"golang.org/x/crypto/ssh"

	"github.com/JustLABv1/justflow/pkg/contracts"

	"github.com/hashicorp/go-plugin"
)

// Plugin is an implementation of the Plugin interface
type Plugin struct{}

var (
	taskCancels   = make(map[string]context.CancelFunc)
	taskCancelsMu sync.Mutex
)

// ifEmpty returns the defaultValue if the input is an empty string, otherwise it returns the input.
func ifEmpty(input, defaultValue string) string {
	if input == "" {
		return defaultValue
	}
	return input
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

	var target string
	var port uint
	var username string
	var password string
	var privateKeyFile string
	var privateKeyFilePassword string
	var useSSHAgent bool
	var commands []string
	var sudo bool
	var sudoPassword string

	// access action params
	for _, param := range request.Step.Action.Params {
		if param.Key == "target" {
			target = param.Value
		}
		if param.Key == "port" {
			portInt, _ := strconv.ParseUint(param.Value, 10, 16)
			port = uint(portInt)
		}
		if param.Key == "username" {
			username = param.Value
		}
		if param.Key == "password" {
			password = param.Value
		}
		if param.Key == "private_key_file" {
			privateKeyFile = param.Value
		}
		if param.Key == "private_key_file_password" {
			privateKeyFilePassword = param.Value
		}
		if param.Key == "use_ssh_agent" {
			useSSHAgent = strings.ToLower(param.Value) == "true"
		}
		if param.Key == "commands" {
			commands = strings.Split(param.Value, "\n")
		}
		if param.Key == "sudo" {
			sudo = strings.ToLower(param.Value) == "true"
		}
		if param.Key == "sudo_password" {
			sudoPassword = param.Value
		}
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

	err := executions.UpdateStep(request.Config, request.Execution.ID.String(), models.ExecutionSteps{
		ID: request.Step.ID,
		Messages: []models.Message{
			{
				Title: "SSH",
				Lines: []models.Line{
					{
						Content:   "Starting ssh action",
						Color:     "primary",
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

	var auth goph.Auth

	// use private key file if provided
	if privateKeyFile != "" {
		auth, err = goph.Key(privateKeyFile, ifEmpty(privateKeyFilePassword, ""))
		if err != nil {
			return plugins.Response{
				Success: false,
			}, err
		}

		err := executions.UpdateStep(request.Config, request.Execution.ID.String(), models.ExecutionSteps{
			ID: request.Step.ID,
			Messages: []models.Message{
				{
					Title: "SSH",
					Lines: []models.Line{
						{
							Content:   "Use private key file to authenticate",
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

	if useSSHAgent {
		auth, err = goph.UseAgent()
		if err != nil {
			return plugins.Response{
				Success: false,
			}, err
		}

		err := executions.UpdateStep(request.Config, request.Execution.ID.String(), models.ExecutionSteps{
			ID: request.Step.ID,
			Messages: []models.Message{
				{
					Title: "SSH",
					Lines: []models.Line{
						{
							Content:   "Use SSH agent to authenticate",
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

	// use password if provided
	if password != "" {
		auth = goph.Password(password)

		err := executions.UpdateStep(request.Config, request.Execution.ID.String(), models.ExecutionSteps{
			ID: request.Step.ID,
			Messages: []models.Message{
				{
					Title: "SSH",
					Lines: []models.Line{
						{
							Content:   "Use password to authenticate",
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

	err = executions.UpdateStep(request.Config, request.Execution.ID.String(), models.ExecutionSteps{
		ID: request.Step.ID,
		Messages: []models.Message{
			{
				Title: "SSH",
				Lines: []models.Line{
					{
						Content:   "Connecting to remote server " + target + " as " + username,
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

	client, err := goph.NewConn(&goph.Config{
		User:     username,
		Addr:     target,
		Port:     port,
		Auth:     auth,
		Timeout:  goph.DefaultTimeout,
		Callback: ssh.InsecureIgnoreHostKey(),
	})
	if err != nil {
		err := executions.UpdateStep(request.Config, request.Execution.ID.String(), models.ExecutionSteps{
			ID: request.Step.ID,
			Messages: []models.Message{
				{
					Title: "SSH",
					Lines: []models.Line{
						{
							Content:   "Failed to connect to remote server",
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

	// Defer closing the network connection.
	defer client.Close()

	for _, command := range commands {
		err := executions.UpdateStep(request.Config, request.Execution.ID.String(), models.ExecutionSteps{
			ID: request.Step.ID,
			Messages: []models.Message{
				{
					Title: "SSH",
					Lines: []models.Line{
						{
							Content:   "-------------------------",
							Timestamp: time.Now(),
						},
						{
							Content:   "Executing command: " + command,
							Color:     "primary",
							Timestamp: time.Now(),
						},
						{
							Content:   "-------------------------",
							Timestamp: time.Now(),
						},
					},
				},
			},
			Status: "running",
		})
		if err != nil {
			return plugins.Response{
				Success: false,
			}, err
		}

		// Execute your command.
		var out []byte
		if sudo {
			out, err = client.RunContext(ctx, "echo "+sudoPassword+"| sudo -S "+command)
		} else {
			out, err = client.RunContext(ctx, command)
		}
		if err != nil && !strings.Contains(err.Error(), "context canceled") {
			err := executions.UpdateStep(request.Config, request.Execution.ID.String(), models.ExecutionSteps{
				ID: request.Step.ID,
				Messages: []models.Message{
					{
						Title: "SSH",
						Lines: []models.Line{
							{
								Content:   "Failed to execute command",
								Color:     "danger",
								Timestamp: time.Now(),
							},
							{
								Content:   err.Error(),
								Color:     "danger",
								Timestamp: time.Now(),
							},
							{
								Content:   "-------------------------",
								Timestamp: time.Now(),
							},
							{
								Content: "-------------------------",
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

			outputLines := strings.Split(string(out), "\n")
			for _, line := range outputLines {
				err = executions.UpdateStep(request.Config, request.Execution.ID.String(), models.ExecutionSteps{
					ID: request.Step.ID,
					Messages: []models.Message{
						{
							Title: "SSH",
							Lines: []models.Line{
								{
									Content:   line,
									Color:     "danger",
									Timestamp: time.Now(),
								},
							},
						},
					},
					Status: "error",
				})
				if err != nil {
					return plugins.Response{
						Success: false,
					}, err
				}
			}

			return plugins.Response{
				Success: false,
			}, err
		}

		outputLines := strings.Split(string(out), "\n")
		for _, line := range outputLines {
			err = executions.UpdateStep(request.Config, request.Execution.ID.String(), models.ExecutionSteps{
				ID: request.Step.ID,
				Messages: []models.Message{
					{
						Title: "SSH",
						Lines: []models.Line{
							{
								Content:   line,
								Timestamp: time.Now(),
							},
						},
					},
				},
				Status: "running",
			})
			if err != nil {
				return plugins.Response{
					Success: false,
				}, err
			}
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
				Title: "SSH",
				Lines: []models.Line{
					{
						Content:   "SSH action completed",
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
		Name:    "SSH",
		Type:    "action",
		Version: "1.6.0-beta.3",
		Author:  "JustNZ",
		Action: models.Action{
			Name:        "SSH",
			Description: "Connect to a remote server using SSH and execute commands",
			Plugin:      "ssh",
			Icon:        "hugeicons:server-stack-03",
			Category:    "Utility",
			Params: []models.Params{
				{
					Key:         "target",
					Title:       "Target",
					Type:        "text",
					Default:     "",
					Required:    true,
					Description: "The target server IP address or hostname",
					Category:    "Destination",
				},
				{
					Key:         "port",
					Title:       "Port",
					Type:        "number",
					Default:     "22",
					Required:    true,
					Description: "The target server port",
					Category:    "Destination",
				},
				{
					Key:         "authentication_method",
					Title:       "Authentication Method",
					Type:        "select",
					Default:     "password",
					Required:    true,
					Description: "The authentication method to use",
					Options: []models.Option{
						{
							Key:   "password",
							Value: "Password",
						},
						{
							Key:   "private_key_file",
							Value: "Private Key File",
						},
						{
							Key:   "ssh_agent",
							Value: "SSH Agent",
						},
					},
					Category: "Credentials",
				},
				{
					Key:         "username",
					Title:       "Username",
					Type:        "text",
					Default:     "",
					Required:    true,
					Description: "The username to authenticate with",
					Category:    "Credentials",
					DependsOn: models.DependsOn{
						Key:   "authentication_method",
						Value: "password",
					},
				},
				{
					Key:         "password",
					Title:       "Password",
					Type:        "password",
					Default:     "",
					Required:    false,
					Description: "The password to authenticate with",
					Category:    "Credentials",
					DependsOn: models.DependsOn{
						Key:   "authentication_method",
						Value: "password",
					},
				},
				{
					Key:         "private_key_file",
					Title:       "Private Key File",
					Type:        "text",
					Default:     "",
					Required:    false,
					Description: "The private key file path to authenticate with. This path must be accessible by the runner",
					Options:     nil,
					Category:    "Credentials",
					DependsOn: models.DependsOn{
						Key:   "authentication_method",
						Value: "private_key_file",
					},
				},
				{
					Key:         "private_key_file_password",
					Title:       "Private Key File Password",
					Type:        "password",
					Default:     "",
					Required:    false,
					Description: "The password to decrypt the private key file",
					Category:    "Credentials",
					DependsOn: models.DependsOn{
						Key:   "authentication_method",
						Value: "private_key_file",
					},
				},
				{
					Key:         "use_ssh_agent",
					Title:       "Use SSH Agent",
					Type:        "boolean",
					Default:     "false",
					Required:    false,
					Description: "Use the SSH agent to authenticate",
					Category:    "Credentials",
					DependsOn: models.DependsOn{
						Key:   "authentication_method",
						Value: "ssh_agent",
					},
				},
				{
					Key:         "sudo",
					Title:       "Use Sudo",
					Type:        "boolean",
					Default:     "false",
					Required:    true,
					Description: "Use sudo to execute the commands",
					Category:    "Privileges",
				},
				{
					Key:         "sudo_password",
					Title:       "Sudo Password",
					Type:        "password",
					Default:     "",
					Required:    false,
					Description: "The password to authenticate with sudo",
					Category:    "Privileges",
					DependsOn: models.DependsOn{
						Key:   "sudo",
						Value: "true",
					},
				},
				{
					Key:         "commands",
					Title:       "Commands",
					Type:        "textarea",
					Default:     "",
					Required:    true,
					Description: "The commands to execute on the remote server. Each command should be on a new line",
					Category:    "Commands",
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
