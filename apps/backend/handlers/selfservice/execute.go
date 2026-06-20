package selfservice

import (
	"errors"
	"fmt"
	"net/http"
	"time"

	"github.com/JustLABv1/justflow/apps/backend/functions/auth"
	"github.com/JustLABv1/justflow/apps/backend/functions/encryption"
	"github.com/JustLABv1/justflow/apps/backend/functions/gatekeeper"
	"github.com/JustLABv1/justflow/apps/backend/functions/httperror"
	"github.com/JustLABv1/justflow/apps/backend/pkg/models"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	log "github.com/sirupsen/logrus"
	"github.com/uptrace/bun"
)

type executeFlowRequest struct {
	Inputs map[string]interface{} `json:"inputs"`
}

// Execute triggers a flow that belongs to a self-service page.
// Any authenticated project member can call this endpoint.
func Execute(context *gin.Context, db *bun.DB) {
	slugOrID := context.Param("slugOrID")
	flowID := context.Param("flowID")

	// Fetch the page
	var page models.SelfServicePage
	if err := db.NewSelect().Model(&page).
		Where("id::text = ? OR slug = ?", slugOrID, slugOrID).
		Scan(context); err != nil {
		httperror.InternalServerError(context, "Error fetching self-service page", err)
		return
	}

	if !page.Enabled {
		httperror.StatusBadRequest(context, "This self-service page is currently disabled", errors.New("page disabled"))
		return
	}

	// Verify the flow is part of this page
	var pageFlow *models.PageFlow
	for i, pf := range page.PageFlows {
		if pf.FlowID == flowID {
			pageFlow = &page.PageFlows[i]
			break
		}
	}
	if pageFlow == nil {
		httperror.StatusBadRequest(context, "Flow is not part of this self-service page", errors.New("flow not found on page"))
		return
	}

	// Check project membership (any role can trigger)
	hasAccess, err := gatekeeper.CheckSelfServicePageAccess(page.ProjectID, context, db)
	if err != nil {
		httperror.InternalServerError(context, "Error checking permissions", err)
		return
	}
	if !hasAccess {
		httperror.Unauthorized(context, "You do not have access to this self-service page", errors.New("unauthorized"))
		return
	}

	// Fetch the flow
	var flow models.Flows
	if err := db.NewSelect().Model(&flow).Where("id::text = ?", flowID).Scan(context); err != nil {
		httperror.InternalServerError(context, "Error fetching flow data", err)
		return
	}
	if flow.Disabled {
		httperror.StatusBadRequest(context, "This flow is currently disabled", errors.New("flow disabled"))
		return
	}
	if flow.Maintenance {
		httperror.StatusBadRequest(context, "This flow is currently in maintenance", errors.New("flow in maintenance"))
		return
	}

	// Parse and validate inputs
	var req executeFlowRequest
	_ = context.ShouldBindJSON(&req)
	if req.Inputs == nil {
		req.Inputs = map[string]interface{}{}
	}

	// Apply page-level default overrides before validation
	for _, pf := range page.PageFlows {
		if pf.FlowID != flowID {
			continue
		}
		for _, override := range pf.InputOverrides {
			if override.Hidden {
				continue
			}
			if override.DefaultValue != "" {
				if _, exists := req.Inputs[override.InputParamID]; !exists {
					req.Inputs[override.InputParamID] = override.DefaultValue
				}
			}
		}
	}

	for _, param := range flow.InputParams {
		// Skip hidden params
		isHidden := false
		for _, pf := range page.PageFlows {
			if pf.FlowID != flowID {
				continue
			}
			for _, override := range pf.InputOverrides {
				if override.InputParamID == param.ID && override.Hidden {
					isHidden = true
				}
			}
		}
		if isHidden {
			continue
		}

		if param.Required {
			val, exists := req.Inputs[param.Name]
			if !exists || val == nil || fmt.Sprintf("%v", val) == "" {
				httperror.StatusBadRequest(context, fmt.Sprintf("Required input '%s' is missing", param.Label), errors.New("missing required input"))
				return
			}
		}
	}

	// Get project for encryption
	var project models.Projects
	if err := db.NewSelect().Model(&project).Where("id = ?", flow.ProjectID).Scan(context); err != nil {
		httperror.InternalServerError(context, "Error collecting project data", err)
		return
	}

	triggeredBy := "self-service:" + page.Slug

	execution := models.Executions{
		ID:          uuid.New(),
		CreatedAt:   time.Now(),
		FlowID:      flowID,
		Status:      "pending",
		TriggeredBy: triggeredBy,
		InputValues: req.Inputs,
	}
	if _, err := db.NewInsert().Model(&execution).Exec(context); err != nil {
		httperror.InternalServerError(context, "Error creating execution", err)
		return
	}

	step := models.ExecutionSteps{
		ExecutionID: execution.ID.String(),
		Action: models.Action{
			Name: "Pick Up",
			Icon: "hugeicons:rocket",
		},
		Messages: []models.Message{
			{
				Title: "Pick Up",
				Lines: []models.Line{
					{
						Content:   "Execution is registered and waiting for runner to pick it up",
						Timestamp: time.Now(),
					},
				},
			},
		},
		Status:    "running",
		CreatedAt: time.Now(),
		StartedAt: time.Now(),
	}

	if project.EncryptionEnabled && len(step.Messages) > 0 {
		step.Messages, err = encryption.EncryptExecutionStepActionMessageWithProject(step.Messages, project.ID.String(), db)
		if err != nil {
			httperror.InternalServerError(context, "Error encrypting execution step action messages", err)
			return
		}
		step.Encrypted = true
	}

	if _, err := db.NewInsert().Model(&step).Exec(context); err != nil {
		log.Error("selfservice: Error adding pick-up step", err)
	}

	context.JSON(http.StatusCreated, gin.H{
		"result":       "success",
		"execution_id": execution.ID,
	})
}

// getUserID extracts the authenticated user's ID from the request token.
func getUserID(context *gin.Context) (string, error) {
	userID, err := auth.GetUserIDFromToken(context.GetHeader("Authorization"))
	if err != nil {
		return "", err
	}
	return userID.String(), nil
}
