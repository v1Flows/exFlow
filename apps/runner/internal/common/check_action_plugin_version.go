package common

import "github.com/JustLABv1/justflow/pkg/contracts"

func CheckActionVersionAgainstPluginVersion(actions []models.Action, step models.ExecutionSteps) (valid bool, danger bool, pluginVersion string) {
	for _, action := range actions {
		if action.Plugin == step.Action.Plugin {
			pluginVersion = action.Version
			break
		}
	}

	// Remove the 'v' prefix from the plugin version if it exists
	if len(pluginVersion) > 0 && pluginVersion[0] == 'v' {
		pluginVersion = pluginVersion[1:]
	}

	if step.Action.Version == "" {
		return true, false, pluginVersion
	}

	if pluginVersion < step.Action.Version {
		return false, false, pluginVersion
	}

	if pluginVersion > step.Action.Version {
		return true, true, pluginVersion
	}

	return true, false, pluginVersion
}
