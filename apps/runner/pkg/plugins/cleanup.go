package plugins

import (
	"fmt"
	"os"
	"path/filepath"

	"github.com/JustLABv1/runner/config"
	log "github.com/sirupsen/logrus"
)

func CleanupUnusedPlugins(pluginRepos []config.PluginConfig, pluginDir string) error {
	// Create a map of used plugins
	usedPlugins := make(map[string]bool)
	for _, plugin := range pluginRepos {
		pluginName := fmt.Sprintf("%s-%s", plugin.Name, plugin.Version)
		usedPlugins[pluginName] = true
	}

	// List all files in the pluginDir
	files, err := os.ReadDir(pluginDir)
	if err != nil {
		return fmt.Errorf("failed to read plugin directory: %v", err)
	}

	// Remove unused plugins
	for _, file := range files {
		if !usedPlugins[file.Name()] {
			pluginPath := filepath.Join(pluginDir, file.Name())
			err := os.Remove(pluginPath)
			if err != nil {
				log.Warnf("Failed to remove unused plugin %s: %v", pluginPath, err)
			} else {
				log.Infof("Removed unused plugin: %s", pluginPath)
			}
		}
	}

	return nil
}
