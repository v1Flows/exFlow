package background_checks

import (
	"context"
	"strings"

	"github.com/Masterminds/semver"
	"github.com/v1Flows/exFlow/services/backend/config"
	"github.com/v1Flows/exFlow/services/backend/functions/encryption"
	"github.com/v1Flows/exFlow/services/backend/pkg/models"
	shared_models "github.com/v1Flows/shared-library/pkg/models"

	"github.com/mohae/deepcopy" // Import for deep copy
	log "github.com/sirupsen/logrus"
	"github.com/uptrace/bun"
)

func checkForFlowActionUpdates(db *bun.DB) {
	context := context.Background()

	log.Info("Bot: Checking for flow action updates")

	// Get all flows that are not disabled
	var flows []models.Flows
	err := db.NewSelect().Model(&flows).Where("disabled = ?", false).Scan(context)
	if err != nil {
		log.Error("Bot: Error getting running runners. ", err)
		return
	}

	// Group flows by project_id
	groupedFlows := groupFlowsByProjectID(flows)

	// Process flows with runner_id "any"
	for projectID, flows := range groupedFlows {
		processFlowsForProject(db, context, projectID, flows)
	}
}

func groupFlowsByProjectID(flows []models.Flows) map[string][]models.Flows {
	groupedFlows := make(map[string][]models.Flows)
	for _, flow := range flows {
		groupedFlows[flow.ProjectID] = append(groupedFlows[flow.ProjectID], flow)
	}
	return groupedFlows
}

func processFlowsForProject(db *bun.DB, context context.Context, projectID string, flows []models.Flows) {
	// Get all runners for the project
	var runners []models.Runners
	err := db.NewSelect().Model(&runners).Where("project_id = ? OR shared_runner = ?", projectID, true).Where("disabled = ?", false).Scan(context)
	if err != nil {
		log.Error("Bot: Error getting running runners. ", err)
		return
	}

	// Process each flow
	for _, flow := range flows {
		updatedFlow := deepcopy.Copy(flow).(models.Flows) // Deep copy the flow
		updateFlowActions(&updatedFlow, runners)

		// Write updated flow to the database
		_, err := db.NewUpdate().Model(&updatedFlow).Where("id = ?", updatedFlow.ID).Set("failure_pipelines = ?, actions = ?", updatedFlow.FailurePipelines, updatedFlow.Actions).Exec(context)
		if err != nil {
			log.Error("Bot: Error updating flow actions. ", err)
		}
	}
}

func updateFlowActions(flow *models.Flows, runners []models.Runners) {
	// Check for action updates in the flow itself
	for j, action := range flow.Actions {
		if len(runners) == 0 {
			if action.UpdateAvailable {
				action.UpdateAvailable = false
				action.UpdateVersion = ""
				action.UpdatedAction = &shared_models.Action{}
				flow.Actions[j] = action
			}
		} else {
			updatedAction := updateActionIfNeeded(flow, action, runners)
			flow.Actions[j] = updatedAction
		}
	}

	// Check for action updates in the failure pipelines
	for i, failurePipeline := range flow.FailurePipelines {
		updatedPipeline := deepcopy.Copy(failurePipeline).(shared_models.FailurePipeline) // Deep copy the pipeline
		for j, action := range updatedPipeline.Actions {

			if len(runners) == 0 {
				if action.UpdateAvailable {
					action.UpdateAvailable = false
					action.UpdateVersion = ""
					action.UpdatedAction = &shared_models.Action{}
					updatedPipeline.Actions[j] = action
				}
			} else {
				updatedAction := updateActionIfNeeded(flow, action, runners)
				updatedPipeline.Actions[j] = updatedAction
			}
		}
		flow.FailurePipelines[i] = updatedPipeline
	}
}

func updateActionIfNeeded(flow *models.Flows, action shared_models.Action, runners []models.Runners) shared_models.Action {
	for _, runner := range runners {
		for _, plugin := range runner.Plugins {
			if action.Plugin == strings.ToLower(plugin.Name) {
				pluginVersion, err := semver.NewVersion(plugin.Version)
				if err != nil {
					log.Errorf("Bot: Error converting plugin version %s to semver: %v", plugin.Version, err)
					continue
				}

				actionVersion, err := semver.NewVersion(action.Version)
				if err != nil {
					log.Errorf("Bot: Error converting action version %s to semver: %v", action.Version, err)
					continue
				}

				if pluginVersion.GreaterThan(actionVersion) {
					return createUpdatedAction(flow, action, plugin)
				}
			}
		}
	}
	return action
}

func createUpdatedAction(flow *models.Flows, action shared_models.Action, plugin shared_models.Plugin) shared_models.Action {
	updatedAction := deepcopy.Copy(action).(shared_models.Action) // Deep copy the action
	updatedAction.UpdateAvailable = true
	updatedAction.UpdateVersion = plugin.Version

	// Create a deep copy of plugin.Action to avoid shared references
	updatedPluginAction := deepcopy.Copy(plugin.Action).(shared_models.Action)
	updatedPluginAction.Version = plugin.Version
	updatedAction.UpdatedAction = &updatedPluginAction

	// Synchronize params between action and updated_action
	for _, param := range action.Params {
		for uP, updatedParam := range updatedAction.UpdatedAction.Params {
			if strings.EqualFold(param.Key, updatedParam.Key) {
				// Use the value from the original action if it exists
				if param.Value != "" {
					updatedAction.UpdatedAction.Params[uP].Value = param.Value
				} else {
					// Otherwise, use the default value
					updatedAction.UpdatedAction.Params[uP].Value = updatedParam.Default

					if config.Config.Encryption.Enabled && flow.EncryptActionParams {
						var err error
						updatedAction.UpdatedAction.Params[uP], err = encryption.EncryptParam(updatedAction.UpdatedAction.Params[uP])
						if err != nil {
							log.Errorf("Bot: Error encrypting action param %s: %v", updatedAction.UpdatedAction.Params[uP].Key, err)
						}
					}
				}
			}
		}
	}

	return updatedAction
}
