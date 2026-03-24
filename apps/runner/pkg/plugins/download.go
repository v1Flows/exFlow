package plugins

import (
	"fmt"
	"io"
	"net/http"
	"os"
	"path/filepath"
	"runtime"

	"github.com/JustLABv1/runner/config"
	log "github.com/sirupsen/logrus"
)

// DownloadAndBuildPlugins downloads and builds plugins from GitHub
func DownloadPlugins(pluginRepos []config.PluginConfig, buildDir string, pluginDir string) (map[string]string, error) {
	pluginPaths := make(map[string]string)

	// Create the pluginDir directory if it doesn't exist
	if _, err := os.Stat(pluginDir); os.IsNotExist(err) {
		err := os.MkdirAll(pluginDir, 0755)
		if err != nil {
			return nil, fmt.Errorf("failed to create build directory: %v", err)
		}
	}

	for _, plugin := range pluginRepos {
		// Define the plugin path with name-version format
		pluginPath := filepath.Join(pluginDir, fmt.Sprintf("%s-%s", plugin.Name, plugin.Version))

		// Check if the plugin already exists
		if _, err := os.Stat(pluginPath); !os.IsNotExist(err) {

			// if plugin version is latest, delete the existing plugin if it exists
			if plugin.Version == "latest" {
				if err := os.RemoveAll(pluginPath); err != nil {
					return nil, fmt.Errorf("failed to remove existing plugin %s: %v", plugin.Name, err)
				}
				log.Info("Removed existing latest plugin: ", pluginPath)
			} else {
				log.Info("Plugin already exists: ", pluginPath)
				pluginPaths[plugin.Name] = pluginPath
				continue
			}
		}

		// Create the plugin file
		pluginFile, err := os.Create(pluginPath)
		if err != nil {
			return nil, fmt.Errorf("failed to create plugin file: %v", err)
		}
		defer pluginFile.Close()

		// set default plugin url if not provided
		if plugin.Url == "" {
			plugin.Url = fmt.Sprintf("https://github.com/JustLABv1/runner-plugins/releases/download/%s-%s/%s-%s-%s-%s", plugin.Name, plugin.Version, plugin.Name, plugin.Version, runtime.GOOS, runtime.GOARCH)
		}

		// Download the plugin
		log.Info("Downloading plugin ", plugin.Name+" | Version "+plugin.Version+" | URL: "+plugin.Url)
		resp, err := http.Get(plugin.Url)
		if err != nil {
			return nil, fmt.Errorf("failed to download plugin %s: %v", plugin.Name, err)
		}
		defer resp.Body.Close()

		// Check server response
		if resp.StatusCode != http.StatusOK {
			return nil, fmt.Errorf("bad status: %s", resp.Status)
		}

		// Writer the body to file
		_, err = io.Copy(pluginFile, resp.Body)
		if err != nil {
			return nil, err
		}

		// change the file permissions
		err = os.Chmod(pluginPath, 0755)
		if err != nil {
			return nil, fmt.Errorf("failed to change plugin file permissions: %v", err)
		}

		pluginPaths[plugin.Name] = pluginPath
	}

	return pluginPaths, nil
}
