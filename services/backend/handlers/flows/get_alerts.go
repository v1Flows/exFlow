package flows

import (
	"errors"
	"net/http"

	"github.com/v1Flows/exFlow/services/backend/functions/encryption"
	"github.com/v1Flows/exFlow/services/backend/functions/gatekeeper"
	"github.com/v1Flows/exFlow/services/backend/functions/httperror"
	"github.com/v1Flows/exFlow/services/backend/pkg/models"

	"github.com/gin-gonic/gin"
	_ "github.com/lib/pq"
	"github.com/uptrace/bun"
)

func GetFlowAlerts(context *gin.Context, db *bun.DB) {
	flowID := context.Param("flowID")

	// get flow
	var flow models.Flows
	err := db.NewSelect().Model(&flow).Where("id = ?", flowID).Scan(context)
	if err != nil {
		httperror.InternalServerError(context, "Error collecting flow data from db", err)
		return
	}

	// check if user has access to project
	access, err := gatekeeper.CheckUserProjectAccess(flow.ProjectID, context, db)
	if err != nil {
		httperror.InternalServerError(context, "Error checking for flow access", err)
		return
	}
	if !access {
		httperror.Unauthorized(context, "You do not have access to this flow", errors.New("you do not have access to this flow"))
		return
	}

	alerts := make([]models.Alerts, 0)
	err = db.NewSelect().Model(&alerts).Where("flow_id = ?", flowID).Order("created_at DESC").Scan(context)
	if err != nil {
		httperror.InternalServerError(context, "Error collecting flow alerts from db", err)
		return
	}

	for i := range alerts {
		if alerts[i].Encrypted {
			alerts[i].Payload, err = encryption.DecryptPayload(alerts[i].Payload, flow.ProjectID, db)
			if err != nil {
				httperror.InternalServerError(context, "Error decrypting payload", err)
				return
			}
		}
	}

	context.JSON(http.StatusOK, gin.H{"alerts": alerts})
}
