package alerts

import (
	"errors"
	"net/http"

	"github.com/JustLABv1/justflow/services/backend/functions/encryption"
	"github.com/JustLABv1/justflow/services/backend/functions/gatekeeper"
	"github.com/JustLABv1/justflow/services/backend/functions/httperror"
	"github.com/JustLABv1/justflow/services/backend/pkg/models"

	"github.com/gin-gonic/gin"
	_ "github.com/lib/pq"
	"github.com/uptrace/bun"
)

func GetGrouped(context *gin.Context, db *bun.DB) {
	var incomingRequest models.IncomingGroupedAlertsRequest
	if err := context.ShouldBindJSON(&incomingRequest); err != nil {
		httperror.StatusBadRequest(context, "Error parsing incoming data", err)
		return
	}

	flow := models.Flows{}
	err := db.NewSelect().Model(&flow).Where("id = ?", incomingRequest.FlowID).Scan(context)
	if err != nil {
		httperror.InternalServerError(context, "Error collecting flows from db", err)
		return
	}

	access, err := gatekeeper.CheckUserProjectAccess(flow.ProjectID, context, db)
	if err != nil {
		httperror.InternalServerError(context, "Error checking your user permissions on project", err)
		return
	}
	if !access {
		httperror.Unauthorized(context, "You are not allowed to view this alert", errors.New("unauthorized"))
		return
	}

	alerts := make([]models.Alerts, 0)

	// check if grouped alerts are enabled
	if flow.GroupAlerts {
		err = db.NewSelect().Model(&alerts).Where("flow_id = ? AND group_key = ? AND status != 'resolved' AND parent_id = ''", incomingRequest.FlowID, incomingRequest.GroupAlertsIdentifier).Order("created_at ASC").Scan(context)
		if err != nil {
			httperror.InternalServerError(context, "Error collecting alerts from db", err)
			return
		}
	} else {
		httperror.StatusNotFound(context, "Grouped alerts are not enabled", nil)
		return
	}

	for i := range alerts {
		if alerts[i].Encrypted {
			alerts[i].Payload, err = encryption.DecryptPayload(alerts[i].Payload, flow.ProjectID, db)
			if err != nil {
				httperror.InternalServerError(context, "Error decrypting alert", err)
				return
			}
		}
	}

	context.JSON(http.StatusOK, gin.H{"alerts": alerts})
}
