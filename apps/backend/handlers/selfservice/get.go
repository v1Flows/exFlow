package selfservice

import (
	"errors"
	"net/http"

	"github.com/JustLABv1/justflow/apps/backend/functions/gatekeeper"
	"github.com/JustLABv1/justflow/apps/backend/functions/httperror"
	"github.com/JustLABv1/justflow/apps/backend/pkg/models"

	"github.com/gin-gonic/gin"
	"github.com/uptrace/bun"
)

func GetPage(context *gin.Context, db *bun.DB) {
	slugOrID := context.Param("slugOrID")

	var page models.SelfServicePage
	err := db.NewSelect().Model(&page).
		Where("id::text = ? OR slug = ?", slugOrID, slugOrID).
		Scan(context)
	if err != nil {
		httperror.InternalServerError(context, "Error fetching self-service page", err)
		return
	}

	hasAccess, err := gatekeeper.CheckSelfServicePageAccess(page.ProjectID, context, db)
	if err != nil {
		httperror.InternalServerError(context, "Error checking permissions", err)
		return
	}
	if !hasAccess {
		httperror.Unauthorized(context, "You do not have access to this self-service page", errors.New("unauthorized"))
		return
	}

	// Enrich: attach flow details (name, description, input_params) for each page flow
	type enrichedPageFlow struct {
		models.PageFlow
		FlowName        string              `json:"flow_name"`
		FlowDescription string              `json:"flow_description"`
		InputParams     []models.InputParam `json:"input_params"`
	}

	enriched := make([]enrichedPageFlow, 0, len(page.PageFlows))
	for _, pf := range page.PageFlows {
		var flow models.Flows
		if err := db.NewSelect().Model(&flow).
			Column("id", "name", "description", "input_params", "disabled", "maintenance").
			Where("id::text = ?", pf.FlowID).
			Scan(context); err == nil {
			enriched = append(enriched, enrichedPageFlow{
				PageFlow:        pf,
				FlowName:        flow.Name,
				FlowDescription: flow.Description,
				InputParams:     flow.InputParams,
			})
		} else {
			enriched = append(enriched, enrichedPageFlow{PageFlow: pf})
		}
	}

	context.JSON(http.StatusOK, gin.H{"page": page, "page_flows": enriched})
}
