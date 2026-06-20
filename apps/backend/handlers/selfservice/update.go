package selfservice

import (
	"errors"
	"fmt"
	"net/http"
	"strings"
	"time"

	"github.com/JustLABv1/justflow/apps/backend/functions/gatekeeper"
	"github.com/JustLABv1/justflow/apps/backend/functions/httperror"
	"github.com/JustLABv1/justflow/apps/backend/pkg/models"

	"github.com/gin-gonic/gin"
	"github.com/uptrace/bun"
)

type updatePageRequest struct {
	Name        *string           `json:"name"`
	Description *string           `json:"description"`
	Slug        *string           `json:"slug"`
	Icon        *string           `json:"icon"`
	Color       *string           `json:"color"`
	Enabled     *bool             `json:"enabled"`
	PageFlows   []models.PageFlow `json:"page_flows"`
}

func UpdatePage(context *gin.Context, db *bun.DB) {
	pageID := context.Param("pageID")

	var page models.SelfServicePage
	if err := db.NewSelect().Model(&page).Where("id = ?", pageID).Scan(context); err != nil {
		httperror.InternalServerError(context, "Error fetching self-service page", err)
		return
	}

	canManage, err := gatekeeper.CheckSelfServicePageManageAccess(page.ProjectID, context, db)
	if err != nil {
		httperror.InternalServerError(context, "Error checking permissions", err)
		return
	}
	if !canManage {
		httperror.Unauthorized(context, "You are not allowed to modify this self-service page", errors.New("unauthorized"))
		return
	}

	var req updatePageRequest
	if err := context.ShouldBindJSON(&req); err != nil {
		httperror.StatusBadRequest(context, "Error parsing incoming data", err)
		return
	}

	columns := []string{"updated_at"}

	if req.Name != nil {
		page.Name = *req.Name
		columns = append(columns, "name")
	}
	if req.Description != nil {
		page.Description = *req.Description
		columns = append(columns, "description")
	}
	if req.Slug != nil {
		newSlug := strings.ToLower(strings.TrimSpace(*req.Slug))
		if !slugRegex.MatchString(newSlug) {
			httperror.StatusBadRequest(context, "Slug must be lowercase alphanumeric with hyphens only", nil)
			return
		}
		// Check uniqueness (exclude current page)
		count, err := db.NewSelect().Model((*models.SelfServicePage)(nil)).
			Where("slug = ? AND id != ?", newSlug, pageID).Count(context)
		if err != nil {
			httperror.InternalServerError(context, "Error checking slug uniqueness", err)
			return
		}
		if count > 0 {
			httperror.StatusConflict(context, fmt.Sprintf("Slug '%s' is already taken", newSlug), nil)
			return
		}
		page.Slug = newSlug
		columns = append(columns, "slug")
	}
	if req.Icon != nil {
		page.Icon = *req.Icon
		columns = append(columns, "icon")
	}
	if req.Color != nil {
		page.Color = *req.Color
		columns = append(columns, "color")
	}
	if req.Enabled != nil {
		page.Enabled = *req.Enabled
		columns = append(columns, "enabled")
	}
	if req.PageFlows != nil {
		page.PageFlows = req.PageFlows
		columns = append(columns, "page_flows")
	}

	page.UpdatedAt = time.Now()
	_, err = db.NewUpdate().Model(&page).Column(columns...).Where("id = ?", pageID).Exec(context)
	if err != nil {
		httperror.InternalServerError(context, "Error updating self-service page", err)
		return
	}

	context.JSON(http.StatusOK, gin.H{"result": "success"})
}
