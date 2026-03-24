package flows

import (
	"net/http"

	"github.com/JustLABv1/justflow/apps/backend/functions/auth"
	"github.com/JustLABv1/justflow/apps/backend/functions/encryption"
	"github.com/JustLABv1/justflow/apps/backend/functions/httperror"
	"github.com/JustLABv1/justflow/apps/backend/pkg/models"

	"github.com/gin-gonic/gin"
	_ "github.com/lib/pq"
	"github.com/uptrace/bun"
)

func GetFlows(context *gin.Context, db *bun.DB) {
	userID, err := auth.GetUserIDFromToken(context.GetHeader("Authorization"))
	if err != nil {
		httperror.InternalServerError(context, "Error receiving userID from token", err)
		return
	}

	flows := make([]models.Flows, 0)
	count, err := db.NewSelect().Model(&flows).Where("project_id::uuid IN (SELECT project_id::uuid FROM project_members WHERE user_id = ? AND invite_pending = false)", userID).ScanAndCount(context)
	if err != nil {
		httperror.InternalServerError(context, "Error collecting flows from db", err)
		return
	}

	// decrypt action params
	tokenString := context.GetHeader("Authorization")
	tokenType, err := auth.GetTypeFromToken(tokenString)
	if err != nil {
		httperror.InternalServerError(context, "Error receiving token type", err)
		return
	}

	var decryptPasswords bool
	if tokenType == "user" || tokenType == "service" {
		decryptPasswords = false
	} else {
		decryptPasswords = true
	}

	for i, flow := range flows {

		// get project data
		var project models.Projects
		err = db.NewSelect().Model(&project).Where("id = ?", flow.ProjectID).Scan(context)
		if err != nil {
			httperror.InternalServerError(context, "Error collecting project data from db", err)
			return
		}

		if project.EncryptionEnabled && len(flow.Actions) > 0 {
			flow.Actions, err = encryption.DecryptParamsWithProject(flow.Actions, flow.ProjectID, decryptPasswords, db)
			if err != nil {
				httperror.InternalServerError(context, "Error decrypting action params", err)
				return
			}

			flows[i].Actions = flow.Actions

			// decrypt failure pipeline actions
			for i, pipeline := range flow.FailurePipelines {
				if pipeline.Actions != nil {
					flow.FailurePipelines[i].Actions, err = encryption.DecryptParamsWithProject(pipeline.Actions, flow.ProjectID, decryptPasswords, db)
					if err != nil {
						httperror.InternalServerError(context, "Error decrypting action params", err)
						return
					}
				}

				flows[i].FailurePipelines = flow.FailurePipelines
			}
		}
	}

	context.JSON(http.StatusOK, gin.H{"flows": flows, "count": count})
}
