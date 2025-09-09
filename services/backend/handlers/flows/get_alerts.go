package flows

import (
	"errors"
	"fmt"
	"net/http"
	"strings"

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

	// Parse pagination params
	limit := 20
	offset := 0
	if l := context.Query("limit"); l != "" {
		fmt.Sscanf(l, "%d", &limit)
	}
	if o := context.Query("offset"); o != "" {
		fmt.Sscanf(o, "%d", &offset)
	}

	// Parse status filter (comma-separated)
	statusParam := context.Query("status")
	var statusList []string
	if statusParam != "" {
		statusList = strings.Split(statusParam, ",")
	}

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
	query := db.NewSelect().Model(&alerts).
		Where("flow_id = ?", flowID)

	if len(statusList) > 0 {
		query = query.Where("status IN (?)", bun.In(statusList))
	}

	err = query.Order("created_at DESC").
		Limit(limit).
		Offset(offset).
		Scan(context)
	if err != nil {
		httperror.InternalServerError(context, "Error collecting alerts from db", err)
		return
	}

	// Count total alerts for pagination (with status filter)
	countQuery := db.NewSelect().
		Model((*models.Alerts)(nil)).
		Where("flow_id = ?", flowID)
	if len(statusList) > 0 {
		countQuery = countQuery.Where("status IN (?)", bun.In(statusList))
	}
	totalAlerts, err := countQuery.Count(context)
	if err != nil {
		httperror.InternalServerError(context, "Error counting alerts", err)
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

	context.JSON(http.StatusOK, gin.H{
		"alerts": alerts,
		"limit":  limit,
		"offset": offset,
		"total":  totalAlerts,
	})
}
