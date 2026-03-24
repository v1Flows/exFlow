package main

import (
	"context"
	"errors"
	"net"
	"net/rpc"
	"os"
	"regexp"
	"strconv"
	"strings"
	"sync"
	"time"

	"github.com/apenella/go-ansible/v2/pkg/execute"
	"github.com/apenella/go-ansible/v2/pkg/execute/configuration"
	"github.com/apenella/go-ansible/v2/pkg/playbook"

	"github.com/JustLABv1/justflow/pkg/contracts"
	"github.com/JustLABv1/runner/pkg/executions"
	"github.com/JustLABv1/runner/pkg/plugins"

	"github.com/hashicorp/go-plugin"
)

// Plugin is an implementation of the Plugin interface
type Plugin struct{}

// Map ANSI color codes to models.Line.Color values
var ansiToLineColor = map[string]string{
	"\033[0;31m": "danger",     // Red
	"\033[0;32m": "success",    // Green
	"\033[0;33m": "warning",    // Yellow
	"\033[0;34m": "primary",    // Blue
	"\033[0;35m": "purple-500", // Purple
	"\033[0;36m": "cyan-500",   // Cyan
	"\033[0;0m":  "",           // Reset
}

var (
	taskCancels   = make(map[string]context.CancelFunc)
	taskCancelsMu sync.Mutex
)

var ansiRegexp = regexp.MustCompile(`\x1b\[[0-9;]*m`)

// Function to strip ANSI color codes and map them to models.Line.Color
func parseAnsiColor(output string) (string, string) {
	for ansiCode, lineColor := range ansiToLineColor {
		if strings.Contains(output, ansiCode) {
			// Remove all ANSI codes from the output
			cleanOutput := ansiRegexp.ReplaceAllString(output, "")
			return cleanOutput, lineColor
		} else if strings.Contains(output, "Whoops! context canceled") {
			return output, "danger" // Handle specific error message
		}
	}
	// Remove all ANSI codes even if not mapped
	cleanOutput := ansiRegexp.ReplaceAllString(output, "")
	return cleanOutput, "" // Default: no color
}

type CustomWriter struct {
	OutputFunc func(string, string)
}

func (cw *CustomWriter) Write(p []byte) (n int, err error) {
	output := string(p)
	cleanOutput, color := parseAnsiColor(output)
	cw.OutputFunc(cleanOutput, color)
	return len(p), nil
}

func handleOutput(output string, color string, request plugins.ExecuteTaskRequest) error {
	err := executions.UpdateStep(request.Config, request.Execution.ID.String(), models.ExecutionSteps{
		ID: request.Step.ID,
		Messages: []models.Message{
			{
				Title: "Ansible Playbook",
				Lines: []models.Line{
					{
						Content:   output,
						Color:     color,
						Timestamp: time.Now(),
					},
				},
			},
		},
		Status: "running",
	})
	if err != nil {
		return err
	}

	return nil
}

func sanitizeErrorMessage(msg, password, becomePass string) string {
	if password != "" {
		msg = strings.ReplaceAll(msg, password, "****")
	}
	if becomePass != "" {
		msg = strings.ReplaceAll(msg, becomePass, "****")
	}
	return msg
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

	play := ""
	inventory := ""
	become := false
	limit := ""
	check := false
	diff := false
	authentication := false
	user := ""
	password := ""
	becomeUser := ""
	becomePass := ""
	verbose := 0
	private_key := ""
	vault := false
	vault_password_file := ""
	vault_password := ""

	// access action params
	for _, param := range request.Step.Action.Params {
		if param.Key == "playbook" {
			if strings.Contains(param.Value, "/") {
				play = request.Workspace + "/" + param.Value
			} else {
				play = param.Value
			}
		}
		if param.Key == "inventory" {
			// if inventory is a path prefix with workspace
			if strings.Contains(param.Value, "/") {
				inventory = request.Workspace + "/" + param.Value
			} else {
				inventory = param.Value
			}
		}
		if param.Key == "become" {
			become = param.Value == "true"
		}
		if param.Key == "limit" {
			limit = param.Value
		}
		if param.Key == "check" {
			check = param.Value == "true"
		}
		if param.Key == "diff" {
			diff = param.Value == "true"
		}
		if param.Key == "authentication" {
			authentication = param.Value == "true"
		}
		if param.Key == "user" {
			user = param.Value
		}
		if param.Key == "password" {
			password = param.Value
		}
		if param.Key == "become_user" {
			becomeUser = param.Value
		}
		if param.Key == "become_pass" {
			becomePass = param.Value
		}
		if param.Key == "verbose" {
			verbose, _ = strconv.Atoi(param.Value)
		}
		if param.Key == "private_key" {
			private_key = param.Value
		}
		if param.Key == "vault" {
			vault = param.Value == "true"
		}
		if param.Key == "vault_password_file" {
			vault_password_file = param.Value
		}
		if param.Key == "vault_password" {
			vault_password = param.Value
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
				Title: "Ansible Playbook",
				Lines: []models.Line{
					{
						Content:   "Starting Ansible Playbook",
						Timestamp: time.Now(),
					},
					{
						Content:   "Playbook: " + play,
						Timestamp: time.Now(),
					},
					{
						Content:   "Inventory: " + inventory,
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

	// check if playbook file exists
	if _, err := os.Stat(play); errors.Is(err, os.ErrNotExist) {
		err = executions.UpdateStep(request.Config, request.Execution.ID.String(), models.ExecutionSteps{
			ID: request.Step.ID,
			Messages: []models.Message{
				{
					Title: "Ansible Playbook",
					Lines: []models.Line{
						{
							Content:   "Playbook file does not exist",
							Color:     "danger",
							Timestamp: time.Now(),
						},
						{
							Content:   sanitizeErrorMessage(err.Error(), password, becomePass),
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
		}, errors.New("playbook file does not exist")
	}

	// if inventory is a file check and not a comma separated list check if file exists
	if !strings.Contains(inventory, ",") && net.ParseIP(inventory) == nil {
		if _, err := os.Stat(inventory); errors.Is(err, os.ErrNotExist) {
			err = executions.UpdateStep(request.Config, request.Execution.ID.String(), models.ExecutionSteps{
				ID: request.Step.ID,
				Messages: []models.Message{
					{
						Title: "Ansible Playbook",
						Lines: []models.Line{
							{
								Content:   "Inventory file does not exist",
								Color:     "danger",
								Timestamp: time.Now(),
							},
							{
								Content:   sanitizeErrorMessage(err.Error(), password, becomePass),
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
			}, errors.New("inventory file does not exist")
		}
	}

	var ansiblePlaybookOptions *playbook.AnsiblePlaybookOptions
	if !authentication {
		ansiblePlaybookOptions = &playbook.AnsiblePlaybookOptions{
			Connection:    "ssh",
			Inventory:     inventory,
			Become:        become,
			Limit:         limit,
			Check:         check,
			Diff:          diff,
			SSHCommonArgs: "-o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null",
			PrivateKey:    private_key,
		}
	} else {
		ansiblePlaybookOptions = &playbook.AnsiblePlaybookOptions{
			Connection:    "ssh",
			Inventory:     inventory,
			Become:        become,
			Limit:         limit,
			Check:         check,
			Diff:          diff,
			User:          user,
			BecomeUser:    becomeUser,
			SSHCommonArgs: "-o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null",
			ExtraVars: map[string]interface{}{
				"ansible_password":    password,
				"ansible_become_pass": becomePass,
			},
			PrivateKey: private_key,
		}
	}

	if verbose == 1 {
		ansiblePlaybookOptions.Verbose = true
		ansiblePlaybookOptions.VerboseV = true
	} else if verbose == 2 {
		ansiblePlaybookOptions.Verbose = true
		ansiblePlaybookOptions.VerboseVV = true
	} else if verbose == 3 {
		ansiblePlaybookOptions.Verbose = true
		ansiblePlaybookOptions.VerboseVVV = true
	} else if verbose == 4 {
		ansiblePlaybookOptions.Verbose = true
		ansiblePlaybookOptions.VerboseVVVV = true
	}

	if vault && (vault_password_file != "" && vault_password == "") {
		ansiblePlaybookOptions.VaultPasswordFile = vault_password_file
	} else if vault && vault_password != "" {
		// create a temporary file with the vault password
		tmpfile, err := os.CreateTemp("", "vault-password")
		if err != nil {
			err = executions.UpdateStep(request.Config, request.Execution.ID.String(), models.ExecutionSteps{
				ID: request.Step.ID,
				Messages: []models.Message{
					{
						Title: "Ansible Playbook",
						Lines: []models.Line{
							{
								Content:   "Failed to create temporary file for vault password",
								Color:     "danger",
								Timestamp: time.Now(),
							},
							{
								Content:   sanitizeErrorMessage(err.Error(), password, becomePass),
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
			}, errors.New("failed to create temporary file for vault password")
		}

		// write the vault password to the temporary file
		_, err = tmpfile.WriteString(vault_password)
		if err != nil {
			err = executions.UpdateStep(request.Config, request.Execution.ID.String(), models.ExecutionSteps{
				ID: request.Step.ID,
				Messages: []models.Message{
					{
						Title: "Ansible Playbook",
						Lines: []models.Line{
							{
								Content:   "Failed to write vault password to temporary file",
								Color:     "danger",
								Timestamp: time.Now(),
							},
							{
								Content:   sanitizeErrorMessage(err.Error(), password, becomePass),
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
			}, errors.New("failed to write vault password to temporary file")
		}

		// close the temporary file
		err = tmpfile.Close()
		if err != nil {
			err = executions.UpdateStep(request.Config, request.Execution.ID.String(), models.ExecutionSteps{
				ID: request.Step.ID,
				Messages: []models.Message{
					{
						Title: "Ansible Playbook",
						Lines: []models.Line{
							{
								Content:   "Failed to close temporary file for vault password",
								Color:     "danger",
								Timestamp: time.Now(),
							},
							{
								Content:   sanitizeErrorMessage(err.Error(), password, becomePass),
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
			}, errors.New("failed to close temporary file for vault password")
		}

		// set the vault password file to the temporary file
		ansiblePlaybookOptions.VaultPasswordFile = tmpfile.Name()
	}

	playbookCmd := playbook.NewAnsiblePlaybookCmd(
		playbook.WithPlaybooks(play),
		playbook.WithPlaybookOptions(ansiblePlaybookOptions),
	)

	// Use a custom writer to capture output
	customWriter := &CustomWriter{
		OutputFunc: func(output string, color string) {
			err := handleOutput(output, color, request)
			if err != nil {
				_ = executions.UpdateStep(request.Config, request.Execution.ID.String(), models.ExecutionSteps{
					ID: request.Step.ID,
					Messages: []models.Message{
						{
							Title: "Ansible Playbook",
							Lines: []models.Line{
								{
									Content:   "Ansible Playbook failed",
									Color:     "danger",
									Timestamp: time.Now(),
								},
								{
									Content:   sanitizeErrorMessage(err.Error(), password, becomePass),
									Color:     "danger",
									Timestamp: time.Now(),
								},
							},
						},
					},
					Status:     "error",
					FinishedAt: time.Now(),
				})
			}
		},
	}

	exec := configuration.NewAnsibleWithConfigurationSettingsExecute(
		execute.NewDefaultExecute(
			execute.WithCmd(playbookCmd),
			execute.WithErrorEnrich(playbook.NewAnsiblePlaybookErrorEnrich()),
			execute.WithWrite(customWriter), // Redirect both stdout and stderr to custom writer.
		),
		configuration.WithAnsibleForceColor(),
	)

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

	err = exec.Execute(ctx)
	if err != nil {
		err = executions.UpdateStep(request.Config, request.Execution.ID.String(), models.ExecutionSteps{
			ID: request.Step.ID,
			Messages: []models.Message{
				{
					Title: "Ansible Playbook",
					Lines: []models.Line{
						{
							Content:   "Ansible Playbook failed",
							Color:     "danger",
							Timestamp: time.Now(),
						},
						{
							Content:   sanitizeErrorMessage(err.Error(), password, becomePass),
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

	// remove the temporary file if it was created
	if vault_password_file == "" && vault_password != "" {
		err = os.Remove(ansiblePlaybookOptions.VaultPasswordFile)
		if err != nil {
			err = executions.UpdateStep(request.Config, request.Execution.ID.String(), models.ExecutionSteps{
				ID: request.Step.ID,
				Messages: []models.Message{
					{
						Title: "Ansible Playbook",
						Lines: []models.Line{
							{
								Content:   "Failed to remove temporary file for vault password",
								Color:     "danger",
								Timestamp: time.Now(),
							},
							{
								Content:   sanitizeErrorMessage(err.Error(), password, becomePass),
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
			}, errors.New("failed to remove temporary file for vault password")
		}
	}

	// update the step with the messages
	err = executions.UpdateStep(request.Config, request.Execution.ID.String(), models.ExecutionSteps{
		ID: request.Step.ID,
		Messages: []models.Message{
			{
				Title: "Ansible Playbook",
				Lines: []models.Line{
					{
						Content:   "Ansible Playbook executed successfully",
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
		Name:    "Ansible",
		Type:    "action",
		Version: "1.5.0-beta.5",
		Author:  "JustNZ",
		Action: models.Action{
			Name:        "Ansible",
			Description: "Execute Ansible Playbook",
			Plugin:      "ansible",
			Icon:        "mdi:ansible",
			Category:    "Automation",
			Params: []models.Params{
				{
					Key:         "playbook",
					Title:       "Playbook",
					Category:    "General",
					Type:        "text",
					Default:     "repo/playbook.yml",
					Required:    true,
					Description: "Path to the playbook file",
				},
				{
					Key:         "inventory",
					Title:       "Inventory",
					Category:    "General",
					Type:        "text",
					Default:     "repo/inventory.ini",
					Required:    true,
					Description: "Path to the inventory file or comma separated host list",
				},
				{
					Key:         "authentication",
					Title:       "Authentication",
					Category:    "Authentication",
					Type:        "boolean",
					Default:     "false",
					Required:    true,
					Description: "Use authentication for the Ansible connection. If enabled, you must provide a authentication method.",
				},
				{
					Key:         "authentication_method",
					Title:       "Authentication Method",
					Type:        "select",
					Default:     "none",
					Required:    false,
					Description: "The authentication method to use",
					Options: []models.Option{
						{
							Key:   "none",
							Value: "None",
						},
						{
							Key:   "password",
							Value: "Password",
						},
						{
							Key:   "private_key_file",
							Value: "Private Key File",
						},
					},
					Category: "Authentication",
					DependsOn: models.DependsOn{
						Key:   "authentication",
						Value: "true",
					},
				},
				{
					Key:         "user",
					Title:       "User",
					Category:    "Authentication",
					Type:        "text",
					Default:     "",
					Required:    false,
					Description: "Connect as this user",
					DependsOn: models.DependsOn{
						Key:   "authentication_method",
						Value: "password",
					},
				},
				{
					Key:         "password",
					Title:       "Password",
					Category:    "Authentication",
					Type:        "password",
					Default:     "",
					Required:    false,
					Description: "Connection user password",
					DependsOn: models.DependsOn{
						Key:   "authentication_method",
						Value: "password",
					},
				},
				{
					Key:         "private_key",
					Title:       "Private Key",
					Category:    "Authentication",
					Type:        "text",
					Default:     "",
					Required:    false,
					Description: "Path to the private key file",
					DependsOn: models.DependsOn{
						Key:   "authentication_method",
						Value: "private_key_file",
					},
				},
				{
					Key:         "limit",
					Title:       "Limit",
					Category:    "General",
					Type:        "text",
					Default:     "",
					Required:    false,
					Description: "Further limit selected hosts to an additional pattern",
				},
				{
					Key:         "become",
					Title:       "Become",
					Category:    "Sudo",
					Type:        "boolean",
					Default:     "false",
					Required:    true,
					Description: "Run playbook with become. Requires authentication to be enabled",
					DependsOn: models.DependsOn{
						Key:   "authentication",
						Value: "true",
					},
				},
				{
					Key:         "become_user",
					Title:       "Become User",
					Category:    "Sudo",
					Type:        "text",
					Default:     "root",
					Required:    false,
					Description: "User to run become tasks with",
					DependsOn: models.DependsOn{
						Key:   "become",
						Value: "true",
					},
				},
				{
					Key:         "become_pass",
					Title:       "Become Password",
					Category:    "Sudo",
					Type:        "password",
					Default:     "",
					Required:    false,
					Description: "Become user password",
					DependsOn: models.DependsOn{
						Key:   "become",
						Value: "true",
					},
				},
				{
					Key:         "vault",
					Title:       "Vault",
					Category:    "Vault",
					Type:        "boolean",
					Default:     "false",
					Required:    true,
					Description: "Use Ansible Vault to encrypt sensitive data",
				},
				{
					Key:         "vault_password_method",
					Title:       "Vault Password Method",
					Type:        "select",
					Default:     "",
					Required:    false,
					Description: "The vault password method to use",
					Options: []models.Option{
						{
							Key:   "password",
							Value: "Password",
						},
						{
							Key:   "password_file",
							Value: "Password File",
						},
					},
					Category: "Vault",
					DependsOn: models.DependsOn{
						Key:   "vault",
						Value: "true",
					},
				},
				{
					Key:         "vault_password_file",
					Title:       "Vault Password File",
					Category:    "Vault",
					Type:        "text",
					Default:     "repo/vault_password_file",
					Required:    false,
					Description: "Path to Vault Password File",
					DependsOn: models.DependsOn{
						Key:   "vault_password_method",
						Value: "password_file",
					},
				},
				{
					Key:         "vault_password",
					Title:       "Vault Password",
					Category:    "Vault",
					Type:        "password",
					Default:     "",
					Required:    false,
					Description: "Vault Password. This will override the vault_password_file",
					DependsOn: models.DependsOn{
						Key:   "vault_password_method",
						Value: "password",
					},
				},
				{
					Key:         "check",
					Title:       "Check",
					Category:    "Utility",
					Type:        "boolean",
					Default:     "false",
					Required:    false,
					Description: "Don't make any changes; instead, try to predict some of the changes that may occur",
				},
				{
					Key:         "diff",
					Title:       "Diff",
					Category:    "Utility",
					Type:        "boolean",
					Default:     "false",
					Required:    false,
					Description: "When changing (small) files and templates, show the differences in those files",
				},
				{
					Key:         "verbose",
					Title:       "Verbose",
					Category:    "Utility",
					Type:        "number",
					Default:     "0",
					Required:    false,
					Description: "Set the verbosity level. Default is 0",
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
