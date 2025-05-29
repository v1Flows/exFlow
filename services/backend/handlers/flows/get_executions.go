package flows

import (
	"errors"
	"fmt"
	"net/http"
	"strings"

	"github.com/v1Flows/exFlow/services/backend/functions/gatekeeper"
	"github.com/v1Flows/exFlow/services/backend/functions/httperror"
	"github.com/v1Flows/exFlow/services/backend/pkg/models"

	"github.com/gin-gonic/gin"
	_ "github.com/lib/pq"
	"github.com/uptrace/bun"
)

func GetFlowExecutions(context *gin.Context, db *bun.DB) {
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

	executions := make([]models.Executions, 0)
	query := db.NewSelect().Model(&executions).
		Where("flow_id = ?", flowID)

	if len(statusList) > 0 {
		query = query.Where("status IN (?)", bun.In(statusList))
	}

	err = query.OrderExpr(`
        CASE 
            WHEN status = 'scheduled' THEN 1
            ELSE 2
        END ASC, 
        CASE 
            WHEN status = 'scheduled' THEN scheduled_at
        END ASC, 
        CASE 
            WHEN status = 'scheduled' THEN NULL
            ELSE created_at
        END DESC
    `).
		Limit(limit).
		Offset(offset).
		Scan(context)
	if err != nil {
		httperror.InternalServerError(context, "Error collecting executions from db", err)
		return
	}

	// Fetch steps for each execution and build ExecutionWithSteps
	executionsWithSteps := make([]models.ExecutionWithSteps, 0, len(executions))
	for _, exec := range executions {
		steps := make([]models.ExecutionSteps, 0)
		err := db.NewSelect().
			Model(&steps).
			Where("execution_id = ?", exec.ID).
			Order("created_at ASC").
			Scan(context)
		if err != nil {
			httperror.InternalServerError(context, "Error collecting execution steps from db", err)
			return
		}
		executionsWithSteps = append(executionsWithSteps, models.ExecutionWithSteps{
			Executions: exec,
			Steps:      steps,
		})
	}

	// Count total executions for pagination (with status filter)
	countQuery := db.NewSelect().
		Model((*models.Executions)(nil)).
		Where("flow_id = ?", flowID)
	if len(statusList) > 0 {
		countQuery = countQuery.Where("status IN (?)", bun.In(statusList))
	}
	totalExecutions, err := countQuery.Count(context)
	if err != nil {
		httperror.InternalServerError(context, "Error counting executions", err)
		return
	}

	context.JSON(http.StatusOK, gin.H{
		"executions": executionsWithSteps,
		"limit":      limit,
		"offset":     offset,
		"total":      totalExecutions,
	})
}
