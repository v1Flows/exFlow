package alerts

import (
	"fmt"
	"net/http"
	"strings"

	"github.com/JustLABv1/justflow/services/backend/functions/auth"
	"github.com/JustLABv1/justflow/services/backend/functions/encryption"
	"github.com/JustLABv1/justflow/services/backend/functions/httperror"
	"github.com/JustLABv1/justflow/services/backend/pkg/models"

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

	// get all flows where the user is a member
	flows := make([]models.Flows, 0)
	err = db.NewSelect().Model(&flows).Column("id", "project_id").Where("project_id::uuid IN (SELECT project_id::uuid FROM project_members WHERE user_id = ? AND invite_pending = false)", userID).Scan(context)
	if err != nil {
		httperror.InternalServerError(context, "Error collecting flows from db", err)
		return
	}

	// put flow ids in an array
	flowsArray := make([]string, 0)
	for _, flow := range flows {
		flowsArray = append(flowsArray, flow.ID.String())
	}

	alerts := make([]models.Alerts, 0)
	query := db.NewSelect().Model(&alerts).
		Where("flow_id IN (?)", bun.In(flowsArray))

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

	for i := range alerts {
		if alerts[i].Encrypted {
			// get flow to find project_id and use the already fetched flows to avoid another db call
			var flowProjectID string
			for _, flow := range flows {
				if flow.ID.String() == alerts[i].FlowID {
					flowProjectID = flow.ProjectID
					break
				}
			}
			if flowProjectID == "" {
				continue
			}

			// Decrypt using the project ID found
			alerts[i].Payload, err = encryption.DecryptPayload(alerts[i].Payload, flowProjectID, db)
			if err != nil {
				httperror.InternalServerError(context, "Error decrypting alert", err)
				return
			}
		}
	}

	// Count total alerts for pagination (with status filter)
	countQuery := db.NewSelect().
		Model((*models.Alerts)(nil)).
		Where("flow_id IN (?)", bun.In(flowsArray))
	if len(statusList) > 0 {
		countQuery = countQuery.Where("status IN (?)", bun.In(statusList))
	}
	totalAlerts, err := countQuery.Count(context)
	if err != nil {
		httperror.InternalServerError(context, "Error counting alerts", err)
		return
	}

	context.JSON(http.StatusOK, gin.H{
		"alerts": alerts,
		"limit":  limit,
		"offset": offset,
		"total":  totalAlerts,
	})
}
