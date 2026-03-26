package selfservice

import (
	"errors"
	"fmt"
	"net/http"
	"regexp"
	"strings"
	"time"

	"github.com/JustLABv1/justflow/apps/backend/functions/gatekeeper"
	"github.com/JustLABv1/justflow/apps/backend/functions/httperror"
	"github.com/JustLABv1/justflow/apps/backend/pkg/models"

	"github.com/gin-gonic/gin"
	"github.com/uptrace/bun"
)

var slugRegex = regexp.MustCompile(`^[a-z0-9]+(?:-[a-z0-9]+)*$`)

type createPageRequest struct {
	Name        string            `json:"name" binding:"required"`
	Description string            `json:"description"`
	Slug        string            `json:"slug" binding:"required"`
	ProjectID   string            `json:"project_id" binding:"required"`
	Icon        string            `json:"icon"`
	Color       string            `json:"color"`
	PageFlows   []models.PageFlow `json:"page_flows"`
}

func CreatePage(context *gin.Context, db *bun.DB) {
	var req createPageRequest
	if err := context.ShouldBindJSON(&req); err != nil {
		httperror.StatusBadRequest(context, "Error parsing incoming data", err)
		return
	}

	req.Slug = strings.ToLower(strings.TrimSpace(req.Slug))
	if !slugRegex.MatchString(req.Slug) {
		httperror.StatusBadRequest(context, "Slug must be lowercase alphanumeric with hyphens only", errors.New("invalid slug format"))
		return
	}

	canManage, err := gatekeeper.CheckSelfServicePageManageAccess(req.ProjectID, context, db)
	if err != nil {
		httperror.InternalServerError(context, "Error checking permissions", err)
		return
	}
	if !canManage {
		httperror.Unauthorized(context, "You are not allowed to create self-service pages for this project", errors.New("unauthorized"))
		return
	}

	count, err := db.NewSelect().Model((*models.SelfServicePage)(nil)).
		Where("slug = ?", req.Slug).Count(context)
	if err != nil {
		httperror.InternalServerError(context, "Error checking slug uniqueness", err)
		return
	}
	if count > 0 {
		httperror.StatusConflict(context, fmt.Sprintf("Slug '%s' is already taken", req.Slug), nil)
		return
	}

	createdBy, _ := getUserID(context)

	page := models.SelfServicePage{
		Name:        req.Name,
		Description: req.Description,
		Slug:        req.Slug,
		ProjectID:   req.ProjectID,
		CreatedBy:   createdBy,
		Icon:        req.Icon,
		Color:       req.Color,
		Enabled:     true,
		PageFlows:   req.PageFlows,
		CreatedAt:   time.Now(),
	}
	if page.PageFlows == nil {
		page.PageFlows = []models.PageFlow{}
	}

	_, err = db.NewInsert().Model(&page).Exec(context)
	if err != nil {
		httperror.InternalServerError(context, "Error creating self-service page", err)
		return
	}

	context.JSON(http.StatusCreated, gin.H{"result": "success", "id": page.ID, "slug": page.Slug})
}
