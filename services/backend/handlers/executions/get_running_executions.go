package executions

import (
	"net/http"

	"github.com/v1Flows/exFlow/services/backend/functions/auth"
	"github.com/v1Flows/exFlow/services/backend/functions/httperror"
	"github.com/v1Flows/exFlow/services/backend/pkg/models"

	"github.com/gin-gonic/gin"
	"github.com/uptrace/bun"
)

func GetRunningExecutions(context *gin.Context, db *bun.DB) {
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

	var summary []struct {
		FlowID string `bun:"flow_id" json:"flow_id"`
		Status string `bun:"status" json:"status"`
		Count  int    `bun:"count" json:"count"`
	}

	err = db.NewSelect().
		Model((*models.Executions)(nil)). // Assuming `Execution` is your model struct
		Column("flow_id", "status").
		ColumnExpr("COUNT(*) AS count").
		Where("flow_id IN (?) AND status NOT IN ('canceled', 'noPatternMatch', 'error', 'success', 'recovered')", bun.In(flowsArray)).
		Group("flow_id", "status").
		Scan(context, &summary)
	if err != nil {
		httperror.InternalServerError(context, "Error collecting executions from db", err)
		return
	}

	executions := make([]models.Executions, 0)
	err = db.NewSelect().Model(&executions).
		Where("flow_id IN (?) AND status NOT IN ('canceled', 'noPatternMatch', 'error', 'success', 'recovered')", bun.In(flowsArray)).
		Scan(context)
	if err != nil {
		httperror.InternalServerError(context, "Error collecting executions from db", err)
		return
	}

	context.JSON(http.StatusOK, gin.H{"executions": executions, "summary": summary})
}
