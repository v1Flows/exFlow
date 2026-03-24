package platform

import (
	"github.com/JustLABv1/runner/config"
)

func GetPlatformConfig(cfg *config.Config) (string, string, string) {
	configManager := config.GetInstance()

	if cfg == nil {
		cfg = configManager.GetConfig()
	}

	return cfg.JustFlow.URL, cfg.JustFlow.APIKey, cfg.JustFlow.RunnerID
}

func GetPlatformConfigPlain(cfg *config.Config) (string, string) {
	configManager := config.GetInstance()

	if cfg == nil {
		cfg = configManager.GetConfig()
	}

	return cfg.JustFlow.URL, cfg.JustFlow.APIKey
}
