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

func GetSingle(context *gin.Context, db *bun.DB) {
	alertID := context.Param("alertID")

	var alert models.Alerts
	err := db.NewSelect().Model(&alert).Where("id = ?", alertID).Scan(context)
	if err != nil {
		httperror.InternalServerError(context, "Error collecting alert data from db", err)
		return
	}

	// get project_id from flow_id
	var flow models.Flows
	err = db.NewSelect().Model(&flow).Where("id = ?", alert.FlowID).Scan(context)
	if err != nil {
		httperror.InternalServerError(context, "Error collecting flow data from db", err)
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

	if alert.Encrypted {
		alert.Payload, err = encryption.DecryptPayload(alert.Payload, flow.ProjectID, db)
		if err != nil {
			httperror.InternalServerError(context, "Error decrypting alert", err)
			return
		}
	}

	context.JSON(http.StatusOK, gin.H{"alert": alert})
}
