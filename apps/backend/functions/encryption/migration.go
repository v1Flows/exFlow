package encryption

import (
	"context"

	"github.com/uptrace/bun"
	"github.com/JustLABv1/justflow/apps/backend/pkg/models"

	log "github.com/sirupsen/logrus"
)

// MigrateProjectEncryption migrates all encrypted data in a project from old key to new key
// This is useful when rotating encryption keys or migrating from global to project-specific encryption
func MigrateProjectsEncryption(oldKey string, db *bun.DB) error {

	// check if already migrated
	var settings models.Settings
	err := db.NewSelect().Model(&settings).Where("id = ?", 1).Scan(context.Background())
	if err != nil {
		return err
	}
	if settings.NewEncryptionMigrated {
		if oldKey != "" {
			log.Info("Projects already migrated, skipping migration. You can remove the old key from the config.")
		}
		return nil
	}

	log.Info("Migrating projects to new encryption algorithm...")

	var projects []models.Projects
	err = db.NewSelect().Model(&projects).Scan(context.Background())
	if err != nil {
		return err
	}

	for _, project := range projects {
		err = EnableProjectEncryption(project.ID.String(), db)
		if err != nil {
			return err
		}

		// Get all flows for this project
		var flows []models.Flows
		err := db.NewSelect().Model(&flows).Where("project_id = ?", project.ID).Scan(context.Background())
		if err != nil {
			return err
		}

		for _, flow := range flows {
			// Decrypt with old key and re-encrypt with new key
			if len(flow.Actions) > 0 {
				// Temporarily decrypt with old key
				decryptedActions, err := DecryptParams(flow.Actions, true)
				if err != nil {
					continue
				}

				// Re-encrypt with new encryption
				encryptedActions, err := EncryptParamsWithProject(decryptedActions, flow.ProjectID, db)
				if err != nil {
					return err
				}

				// Update the flow with re-encrypted data
				_, err = db.NewUpdate().Model(&flow).Set("actions = ?", encryptedActions).Where("id = ?", flow.ID).Exec(context.Background())
				if err != nil {
					return err
				}
			}

			// Handle failure pipeline actions
			for i, pipeline := range flow.FailurePipelines {
				if len(pipeline.Actions) > 0 {
					// Temporarily decrypt with old key
					decryptedActions, err := DecryptParams(pipeline.Actions, true)
					if err != nil {
						continue
					}

					// Re-encrypt with new key
					encryptedActions, err := EncryptParamsWithProject(decryptedActions, flow.ProjectID, db)
					if err != nil {
						return err
					}

					flow.FailurePipelines[i].Actions = encryptedActions
				}
			}

			// Update failure pipelines
			_, err = db.NewUpdate().Model(&flow).Set("failure_pipelines = ?", flow.FailurePipelines).Where("id = ?", flow.ID).Exec(context.Background())
			if err != nil {
				return err
			}

			// migrate execution step messages
			var executions []models.Executions
			err = db.NewSelect().Model(&executions).Where("flow_id = ?", flow.ID).Scan(context.Background())
			if err != nil {
				return err
			}

			for _, execution := range executions {
				var steps []models.ExecutionSteps
				err = db.NewSelect().Model(&steps).Where("execution_id = ?", execution.ID).Scan(context.Background())
				if err != nil {
					return err
				}

				for _, step := range steps {
					// Decrypt with old key and re-encrypt with new key
					if len(step.Messages) > 0 {
						// Temporarily decrypt with old key
						decryptedMessages, err := DecryptExecutionStepActionMessage(step.Messages)
						if err != nil {
							continue
						}

						// Re-encrypt with new encryption
						encryptedMessages, err := EncryptExecutionStepActionMessageWithProject(decryptedMessages, project.ID.String(), db)
						if err != nil {
							return err
						}

						// Update the step with re-encrypted data
						_, err = db.NewUpdate().Model(&step).Set("messages = ?", encryptedMessages).Where("id = ?", step.ID).Exec(context.Background())
						if err != nil {
							return err
						}
					}
				}
			}
		}
	}

	// set new_encryption_migrated in settings
	_, err = db.NewUpdate().Model(&models.Settings{}).Set("new_encryption_migrated = ?", true).Where("id = ?", 1).Exec(context.Background())
	if err != nil {
		return err
	}

	log.Info("Projects migrated successfully")

	return nil
}
