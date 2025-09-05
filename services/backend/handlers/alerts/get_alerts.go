package alerts

import (
	"net/http"

	"github.com/google/uuid"
	"github.com/v1Flows/exFlow/services/backend/functions/auth"
	"github.com/v1Flows/exFlow/services/backend/functions/encryption"
	"github.com/v1Flows/exFlow/services/backend/functions/httperror"
	"github.com/v1Flows/exFlow/services/backend/pkg/models"

	"github.com/gin-gonic/gin"
	_ "github.com/lib/pq"
	"github.com/uptrace/bun"
)

func GetMultiple(context *gin.Context, db *bun.DB) {
	userID, err := auth.GetUserIDFromToken(context.GetHeader("Authorization"))
	if err != nil {
		httperror.InternalServerError(context, "Error receiving userID from token", err)
		return
	}

	// get all flows where the user is a member
	flows := make([]models.Flows, 0)
	err = db.NewSelect().Model(&flows).Column("id").Where("project_id::uuid IN (SELECT project_id::uuid FROM project_members WHERE user_id = ? AND invite_pending = false)", userID).Scan(context)
	if err != nil {
		httperror.InternalServerError(context, "Error collecting flows from db", err)
		return
	}

	alerts := make([]models.Alerts, 0)

	// get all alerts for each flow
	flowIDs := make([]uuid.UUID, len(flows))
	for i, flow := range flows {
		flowIDs[i] = flow.ID
	}

	err = db.NewSelect().Model(&alerts).Where("flow_id IN (?)", bun.In(flowIDs)).Order("created_at DESC").Scan(context)
	if err != nil {
		httperror.InternalServerError(context, "Error collecting alerts from db", err)
		return
	}

	for i := range alerts {
		if alerts[i].Encrypted {
			alerts[i].Payload, err = encryption.DecryptPayload(alerts[i].Payload, alerts[i].FlowID, db)
			if err != nil {
				httperror.InternalServerError(context, "Error decrypting alert", err)
				return
			}
		}
	}

	context.JSON(http.StatusOK, gin.H{"alerts": alerts})
}
