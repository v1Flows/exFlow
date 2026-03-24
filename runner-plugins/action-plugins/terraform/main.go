package main

import (
	"context"
	"errors"
	"net/rpc"
	"os"
	"strconv"
	"strings"
	"sync"
	"time"

	"github.com/JustLABv1/runner/pkg/executions"
	"github.com/JustLABv1/runner/pkg/plugins"

	"github.com/JustLABv1/justflow/pkg/contracts"

	"github.com/hashicorp/go-plugin"
	"github.com/hashicorp/terraform-exec/tfexec"

	"github.com/hashicorp/go-version"
	"github.com/hashicorp/hc-install/product"
	"github.com/hashicorp/hc-install/releases"
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

	tf_version := ""
	workdir := ""
	init := false
	plan := false
	plan_output := ""
	plan_show := false
	apply := false

	for _, param := range request.Step.Action.Params {
		if param.Key == "tf_version" {
			tf_version = param.Value
		}
		if param.Key == "workdir" {
			workdir = request.Workspace + "/" + param.Value
		}
		if param.Key == "init" {
			init, _ = strconv.ParseBool(param.Value)
		}
		if param.Key == "plan" {
			plan, _ = strconv.ParseBool(param.Value)
		}
		if param.Key == "plan_output" {

			// if the file ends with .tf fail
			if strings.HasSuffix(param.Value, ".tf") {
				err := executions.UpdateStep(request.Config, request.Execution.ID.String(), models.ExecutionSteps{
					ID: request.Step.ID,
					Messages: []models.Message{
						{
							Title: "Terraform",
							Lines: []models.Line{
								{
									Content:   "Terraform Plan Output file cannot end with .tf",
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

			plan_output = param.Value
		}
		if param.Key == "plan_show" {
			plan_show, _ = strconv.ParseBool(param.Value)
		}
		if param.Key == "apply" {
			apply, _ = strconv.ParseBool(param.Value)
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
				Title: "Terraform",
				Lines: []models.Line{
					{
						Content:   "Terraform Action started",
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

	// switch to workdir
	err = os.Chdir(workdir)
	if err != nil {
		return plugins.Response{
			Success: false,
		}, err
	}

	installer := &releases.ExactVersion{
		Product: product.Terraform,
		Version: version.Must(version.NewVersion(tf_version)),
	}

	execPath, err := installer.Install(ctx)
	if err != nil {
		err := executions.UpdateStep(request.Config, request.Execution.ID.String(), models.ExecutionSteps{
			ID: request.Step.ID,
			Messages: []models.Message{
				{
					Title: "Terraform",
					Lines: []models.Line{
						{
							Content:   "Terraform Install failed",
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
				Title: "Terraform",
				Lines: []models.Line{
					{
						Content:   "Terraform Install completed",
						Color:     "success",
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

	tf, err := tfexec.NewTerraform(workdir, execPath)
	if err != nil {
		err := executions.UpdateStep(request.Config, request.Execution.ID.String(), models.ExecutionSteps{
			ID: request.Step.ID,
			Messages: []models.Message{
				{
					Title: "Terraform",
					Lines: []models.Line{
						{
							Content:   "Terraform NewTerraform failed",
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
				Title: "Terraform",
				Lines: []models.Line{
					{
						Content:   "Terraform NewTerraform completed",
						Color:     "success",
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

	if init {
		err = tf.Init(ctx, tfexec.Upgrade(false))
		if err != nil {
			err := executions.UpdateStep(request.Config, request.Execution.ID.String(), models.ExecutionSteps{
				ID: request.Step.ID,
				Messages: []models.Message{
					{
						Title: "Terraform",
						Lines: []models.Line{
							{
								Content:   "Terraform Init failed",
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
					Title: "Terraform",
					Lines: []models.Line{
						{
							Content:   "Terraform Init completed",
							Color:     "success",
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

	if plan {
		diff, err := tf.Plan(ctx, tfexec.Out(plan_output))
		if err != nil {
			err := executions.UpdateStep(request.Config, request.Execution.ID.String(), models.ExecutionSteps{
				ID: request.Step.ID,
				Messages: []models.Message{
					{
						Title: "Terraform",
						Lines: []models.Line{
							{
								Content:   "Terraform Plan failed",
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

		if diff {
			err := executions.UpdateStep(request.Config, request.Execution.ID.String(), models.ExecutionSteps{
				ID: request.Step.ID,
				Messages: []models.Message{
					{
						Title: "Terraform",
						Lines: []models.Line{
							{
								Content:   "Terraform Plan has changes",
								Color:     "warning",
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

			if plan_show {
				plan, err := tf.ShowPlanFileRaw(ctx, plan_output)
				if err != nil {
					err := executions.UpdateStep(request.Config, request.Execution.ID.String(), models.ExecutionSteps{
						ID: request.Step.ID,
						Messages: []models.Message{
							{
								Title: "Terraform",
								Lines: []models.Line{
									{
										Content:   "Terraform Plan show failed",
										Color:     "danger",
										Timestamp: time.Now(),
									},
									{
										Content:   "Plan output file: " + plan_output,
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

				// Split the plan output by lines
				lines := strings.Split(plan, "\n")
				var messageLines []models.Line
				for _, line := range lines {
					color := "" // Default color
					trimmedLine := strings.TrimSpace(line)
					if strings.HasPrefix(trimmedLine, "+") {
						color = "success" // Color for additions
					} else if strings.HasPrefix(trimmedLine, "-") {
						// Check if the line is a list item (e.g., starts with "- " or "-\t")
						if strings.HasPrefix(trimmedLine, "- ") || strings.HasPrefix(trimmedLine, "-\t") {
							color = "" // Neutral color for list items
						} else {
							color = "danger" // Color for deletions
						}
					}
					messageLines = append(messageLines, models.Line{
						Content:   line,
						Color:     color, // Assign the color
						Timestamp: time.Now(),
					})
				}

				err = executions.UpdateStep(request.Config, request.Execution.ID.String(), models.ExecutionSteps{
					ID: request.Step.ID,
					Messages: []models.Message{
						{
							Title: "Terraform",
							Lines: messageLines,
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

		} else {
			err := executions.UpdateStep(request.Config, request.Execution.ID.String(), models.ExecutionSteps{
				ID: request.Step.ID,
				Messages: []models.Message{
					{
						Title: "Terraform",
						Lines: []models.Line{
							{
								Content:   "Terraform Plan has no changes",
								Color:     "success",
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

	if apply {
		// Fail if no plan_output is specified
		if plan_output == "" {
			err := executions.UpdateStep(request.Config, request.Execution.ID.String(), models.ExecutionSteps{
				ID: request.Step.ID,
				Messages: []models.Message{
					{
						Title: "Terraform",
						Lines: []models.Line{
							{
								Content:   "Terraform Apply requires a plan_output file",
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

		err = tf.Apply(ctx, tfexec.DirOrPlan(plan_output))
		if err != nil {
			err := executions.UpdateStep(request.Config, request.Execution.ID.String(), models.ExecutionSteps{
				ID: request.Step.ID,
				Messages: []models.Message{
					{
						Title: "Terraform",
						Lines: []models.Line{
							{
								Content:   "Terraform Apply failed",
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
					Title: "Terraform",
					Lines: []models.Line{
						{
							Content:   "Terraform Apply completed",
							Color:     "success",
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

	err = executions.UpdateStep(request.Config, request.Execution.ID.String(), models.ExecutionSteps{
		ID: request.Step.ID,
		Messages: []models.Message{
			{
				Title: "Terraform",
				Lines: []models.Line{
					{
						Content:   "Terraform Action completed",
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
		Name:    "Terraform",
		Type:    "action",
		Version: "1.1.0-beta.5",
		Author:  "JustNZ",
		Action: models.Action{
			Name:        "Terraform",
			Description: "Init, Plan, Apply Terraform",
			Plugin:      "terraform",
			Icon:        "logos:terraform-icon",
			Category:    "Utility",
			Params: []models.Params{
				{
					Key:         "tf_version",
					Title:       "Terraform Version",
					Type:        "text",
					Category:    "General",
					Default:     "1.0.6",
					Required:    true,
					Description: "Terraform Version to use",
				},
				{
					Key:         "workdir",
					Title:       "Working Directory",
					Type:        "text",
					Category:    "General",
					Default:     ".",
					Required:    true,
					Description: "Working directory where terraform files are located",
				},
				{
					Key:         "init",
					Title:       "Initialize",
					Type:        "boolean",
					Category:    "Init",
					Default:     "false",
					Required:    false,
					Description: "Perform an terraform init",
				},
				{
					Key:         "plan",
					Title:       "Plan",
					Type:        "boolean",
					Category:    "Plan",
					Default:     "false",
					Required:    false,
					Description: "Perform an terraform plan",
				},
				{
					Key:         "plan_output",
					Title:       "Plan Output",
					Type:        "text",
					Category:    "Plan",
					Default:     "./plan.tfplan",
					Required:    false,
					Description: "Output the terraform plan to a file",
					DependsOn: models.DependsOn{
						Key:   "plan",
						Value: "true",
					},
				},
				{
					Key:         "plan_show",
					Title:       "Plan Show",
					Type:        "boolean",
					Category:    "Plan",
					Default:     "false",
					Required:    false,
					Description: "Show the terraform plan output. Requires a plan_output file",
					DependsOn: models.DependsOn{
						Key:   "plan_output",
						Value: "*",
					},
				},
				{
					Key:         "apply",
					Title:       "Apply",
					Type:        "boolean",
					Default:     "false",
					Category:    "Apply",
					Required:    false,
					Description: "Perform an terraform apply. Requires a plan_output file",
					DependsOn: models.DependsOn{
						Key:   "plan_output",
						Value: "*",
					},
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
