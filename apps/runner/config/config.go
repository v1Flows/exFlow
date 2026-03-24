package config

import (
	"fmt"
	"os"
	"strings"
	"sync"

	log "github.com/sirupsen/logrus"
	"github.com/spf13/viper"
)

// ConfigurationManager handles all configuration operations
type ConfigurationManager struct {
	config *Config
	mu     sync.RWMutex
	viper  *viper.Viper
}

// Config represents the application configuration
type Config struct {
	LogLevel     string            `mapstructure:"log_level" validate:"required,oneof=debug info warn error"`
	Mode         string            `mapstructure:"mode" validate:"required,oneof=master worker"`
	JustFlow     justflowConfig    `mapstructure:"justflow" validate:"required"`
	ApiEndpoint  ApiEndpointConfig `mapstructure:"api_endpoint" validate:"required"`
	WorkspaceDir string            `mapstructure:"workspace_dir" validate:"dir"`
	PluginDir    string            `mapstructure:"plugin_dir" validate:"dir"`
	Plugins      []PluginConfig    `mapstructure:"plugins"`
	Runner       RunnerConf        `mapstructure:"runner"`
}

type justflowConfig struct {
	URL      string `mapstructure:"url" validate:"required,url"`
	RunnerID string `mapstructure:"runner_id"`
	APIKey   string `mapstructure:"api_key"`
}

type ApiEndpointConfig struct {
	Port int `mapstructure:"port" validate:"required,min=1024,max=65535"`
}

type PluginConfig struct {
	Name    string `mapstructure:"name" validate:"required"`
	Url     string `mapstructure:"url" validate:"required,url"`
	Version string `mapstructure:"version" validate:"required"`
}

type RunnerConf struct {
	SharedRunnerSecret string `mapstructure:"shared_runner_secret"`
}

const (
	defaultLogLevel = "info"
	defaultMode     = "master"
	defaultPort     = 8081
)

var (
	instance *ConfigurationManager
	once     sync.Once
)

// GetInstance returns the singleton configuration manager instance
func GetInstance() *ConfigurationManager {
	once.Do(func() {
		instance = &ConfigurationManager{
			viper: viper.New(),
		}
	})
	return instance
}

// LoadConfig initializes the configuration from file and environment
func (cm *ConfigurationManager) LoadConfig(configFile string) error {
	cm.mu.Lock()
	defer cm.mu.Unlock()

	// Set up Viper
	cm.viper.SetConfigFile(configFile)
	cm.viper.SetEnvPrefix("RUNNER")
	cm.viper.SetEnvKeyReplacer(strings.NewReplacer(".", "_"))
	cm.viper.AutomaticEnv()

	// Bind specific environment variables
	envBindings := map[string]string{
		"log_level":                   "RUNNER_LOG_LEVEL",
		"mode":                        "RUNNER_MODE",
		"exflow.url":                  "RUNNER_EXFLOW_URL",
		"exflow.runner_id":            "RUNNER_EXFLOW_RUNNER_ID",
		"exflow.api_key":              "RUNNER_EXFLOW_API_KEY",
		"api_endpoint.port":           "RUNNER_API_ENDPOINT_PORT",
		"workspace_dir":               "RUNNER_WORKSPACE_DIR",
		"plugin_dir":                  "RUNNER_PLUGIN_DIR",
		"runner.shared_runner_secret": "RUNNER_RUNNER_SHARED_RUNNER_SECRET",
	}

	for configKey, envVar := range envBindings {
		if err := cm.viper.BindEnv(configKey, envVar); err != nil {
			return fmt.Errorf("failed to bind env var %s: %w", envVar, err)
		}
	}

	// Read configuration file
	if err := cm.viper.ReadInConfig(); err != nil {
		return fmt.Errorf("failed to read config file: %w", err)
	}

	// Create new config instance
	var config Config

	// Set defaults
	cm.setDefaults(&config)

	// Unmarshal configuration
	if err := cm.viper.Unmarshal(&config); err != nil {
		return fmt.Errorf("failed to unmarshal config: %w", err)
	}

	// Validate configuration
	if err := cm.validateConfig(&config); err != nil {
		return fmt.Errorf("config validation failed: %w", err)
	}

	// Store the config
	cm.config = &config

	log.WithFields(log.Fields{
		"file":    configFile,
		"content": cm.viper.AllSettings(),
	}).Debug("Configuration loaded successfully")

	return nil
}

func (cm *ConfigurationManager) setDefaults(config *Config) {
	if config.LogLevel == "" {
		config.LogLevel = defaultLogLevel
	}
	if config.Mode == "" {
		config.Mode = defaultMode
	}
	if config.ApiEndpoint.Port == 0 {
		config.ApiEndpoint.Port = defaultPort
	}
	if config.WorkspaceDir == "" {
		// get the current working directory and add plugins folder
		currentDir, err := os.Getwd()
		if err != nil {
			log.Fatalf("failed to get current working directory: %v", err)
		}
		config.WorkspaceDir = currentDir + "/workspace"
	}
	if config.PluginDir == "" {
		// get the current working directory and add plugins folder
		currentDir, err := os.Getwd()
		if err != nil {
			log.Fatalf("failed to get current working directory: %v", err)
		}
		config.PluginDir = currentDir + "/plugins"
	}
}

func (cm *ConfigurationManager) validateConfig(config *Config) error {
	if config.JustFlow.APIKey == "" && config.Runner.SharedRunnerSecret == "" {
		return fmt.Errorf("justflow.api_key or runner.shared_runner_secret is required")
	}
	if config.JustFlow.URL == "" {
		return fmt.Errorf("justflow URL is required")
	}

	return nil
}

// GetConfig returns a copy of the current configuration
func (cm *ConfigurationManager) GetConfig() *Config {
	cm.mu.RLock()
	defer cm.mu.RUnlock()
	return cm.config
}

// UpdateRunnerID updates the runner ID in the configuration for JustFlow
func (cm *ConfigurationManager) UpdateRunnerID(id string) {
	cm.mu.Lock()
	defer cm.mu.Unlock()
	cm.config.JustFlow.RunnerID = id
}

// UpdateRunnerApiKey updates the runner api_key in the configuration for JustFlow
func (cm *ConfigurationManager) UpdateRunnerApiKey(apiKey string) {
	cm.mu.Lock()
	defer cm.mu.Unlock()
	cm.config.JustFlow.APIKey = apiKey
}

// GetRunnerIDs returns the current runner IDs for JustFlow
func (cm *ConfigurationManager) GetRunnerID() string {
	cm.mu.RLock()
	defer cm.mu.RUnlock()
	return cm.config.JustFlow.RunnerID
}

// GetRunnerIDs returns the current runner apiKey for JustFlow
func (cm *ConfigurationManager) GetRunnerApiKey() string {
	cm.mu.RLock()
	defer cm.mu.RUnlock()
	return cm.config.JustFlow.APIKey
}

// ReloadConfig reloads the configuration from the file
func (cm *ConfigurationManager) ReloadConfig() error {
	return cm.LoadConfig(cm.viper.ConfigFileUsed())
}
