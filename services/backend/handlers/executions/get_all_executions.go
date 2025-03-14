package executions

import (
	"github.com/v1Flows/exFlow/services/backend/functions/auth"
	"github.com/v1Flows/exFlow/services/backend/functions/httperror"
	"github.com/v1Flows/exFlow/services/backend/pkg/models"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/uptrace/bun"
)

func GetExecutions(context *gin.Context, db *bun.DB) {
	userID, err := auth.GetUserIDFromToken(context.GetHeader("Authorization"))
	if err != nil {
		httperror.InternalServerError(context, "Error receiving userID from token", err)
		return
	}

	// get flows where user is a member
	flows := make([]models.Flows, 0)
	err = db.NewSelect().Model(&flows).Column("id").Where("project_id::uuid IN (SELECT project_id::uuid FROM project_members WHERE user_id = ? AND invite_pending = false)", userID).Scan(context)
	if err != nil {
		httperror.InternalServerError(context, "Error collecting flows from db", err)
		return
	}

	// put flow ids in an array
	flowsArray := make([]string, 0)
	for _, flow := range flows {
		flowsArray = append(flowsArray, flow.ID.String())
	}

	executions := make([]models.Executions, 0)
	err = db.NewSelect().Model(&executions).Where("flow_id IN (?)", bun.In(flowsArray)).Order("created_at DESC").Scan(context)
	if err != nil {
		httperror.InternalServerError(context, "Error collecting executions from db", err)
		return
	}

	context.JSON(http.StatusOK, gin.H{"executions": executions})
}
