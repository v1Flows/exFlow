package config

import (
	"fmt"
	"strings"
	"sync"

	log "github.com/sirupsen/logrus"
	"github.com/spf13/viper"
)

var (
	instance *ConfigurationManager
	once     sync.Once
	// Expose loaded config as a package-level variable
	Config *RestfulConf
)

// ConfigurationManager handles all configuration operations
type ConfigurationManager struct {
	config *RestfulConf
	mu     sync.RWMutex
	viper  *viper.Viper
}

type RestfulConf struct {
	LogLevel   string         `mapstructure:"log_level" validate:"required,oneof=debug info warn error"`
	Port       int            `mapstructure:"port" validate:"required"`
	Database   DatabaseConf   `mapstructure:"database" validate:"required"`
	JWT        JWTConf        `mapstructure:"jwt" validate:"required"`
	Encryption EncryptionConf `mapstructure:"encryption" validate:"required"`
}

type DatabaseConf struct {
	Driver   string `mapstructure:"driver" validate:"required,oneof=postgres"`
	Server   string `mapstructure:"server"`
	Port     int    `mapstructure:"port"`
	Name     string `mapstructure:"name"`
	User     string `mapstructure:"user"`
	Password string `mapstructure:"password"`
}

type JWTConf struct {
	Secret string `mapstructure:"secret" validate:"required"`
}

type EncryptionConf struct {
	Enabled bool   `mapstructure:"enabled" validate:"required"`
	Key     string `mapstructure:"key"`
}

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

	// Read configuration file
	if err := cm.viper.ReadInConfig(); err != nil {
		return fmt.Errorf("failed to read config file: %w", err)
	}

	// Create new config instance
	var config RestfulConf

	// Set defaults
	cm.setDefaults(&config)

	// Unmarshal configuration
	if err := cm.viper.Unmarshal(&config); err != nil {
		return fmt.Errorf("failed to unmarshal config: %w", err)
	}

	// Store the config
	cm.config = &config

	// Assign to package-level variable for global access
	Config = &config

	log.WithFields(log.Fields{
		"file":    configFile,
		"content": cm.viper.AllSettings(),
	}).Debug("Configuration loaded successfully")

	return nil
}

func (cm *ConfigurationManager) setDefaults(config *RestfulConf) {
	if config.LogLevel == "" {
		config.LogLevel = "info"
	}
	if config.Port == 0 {
		config.Port = 8080
	}
	if config.Database.Driver == "" {
		config.Database.Driver = "postgres"
	}
}

// GetConfig returns a copy of the current configuration
func (cm *ConfigurationManager) GetConfig() RestfulConf {
	cm.mu.RLock()
	defer cm.mu.RUnlock()
	return *cm.config
}

// Global accessor for config
func GetConfigInstance() *RestfulConf {
	cfg := GetInstance().config
	if cfg == nil {
		panic("config: configuration not loaded, call LoadConfig first")
	}
	return cfg
}
