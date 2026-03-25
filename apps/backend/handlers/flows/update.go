package flows

import (
	"bytes"
	"encoding/json"
	"errors"
	"io"
	"net/http"
	"time"

	"github.com/JustLABv1/justflow/apps/backend/functions/gatekeeper"
	"github.com/JustLABv1/justflow/apps/backend/functions/httperror"
	functions_project "github.com/JustLABv1/justflow/apps/backend/functions/project"
	"github.com/JustLABv1/justflow/apps/backend/pkg/models"

	"github.com/gin-gonic/gin"
	_ "github.com/lib/pq"
	log "github.com/sirupsen/logrus"
	"github.com/uptrace/bun"
)

func UpdateFlow(context *gin.Context, db *bun.DB) {
	flowID := context.Param("flowID")

	// Read the body
	bodyBytes, err := io.ReadAll(context.Request.Body)
	if err != nil {
		httperror.StatusBadRequest(context, "Error reading request body", err)
		return
	}
	// Restore the body so we can unmarshal it multiple times if needed
	context.Request.Body = io.NopCloser(bytes.NewBuffer(bodyBytes))

	var inputMap map[string]interface{}
	if err := json.Unmarshal(bodyBytes, &inputMap); err != nil {
		httperror.StatusBadRequest(context, "Error parsing incoming data", err)
		return
	}

	var flow models.Flows
	if err := json.Unmarshal(bodyBytes, &flow); err != nil {
		httperror.StatusBadRequest(context, "Error parsing incoming data to struct", err)
		return
	}

	var flowDB models.Flows
	err = db.NewSelect().Model(&flowDB).Where("id = ?", flowID).Scan(context)
	if err != nil {
		httperror.InternalServerError(context, "Error collecting flow data on db", err)
		return
	}

	// Determine the project ID to check access for.
	// If project_id is being updated, check access to the new project.
	// Otherwise, check access to the existing project.
	checkProjectID := flowDB.ProjectID
	if pid, ok := inputMap["project_id"]; ok {
		checkProjectID = pid.(string)
	}

	// check if user has access to project
	access, err := gatekeeper.CheckUserProjectAccess(checkProjectID, context, db)
	if err != nil {
		httperror.InternalServerError(context, "Error checking for flow access", err)
		return
	}
	if !access {
		httperror.Unauthorized(context, "You do not have access to this flow", errors.New("you do not have access to this flow"))
		return
	}

	// check the requestors role in project
	canModify, err := gatekeeper.CheckRequestUserProjectModifyRole(checkProjectID, context, db)
	if err != nil {
		httperror.InternalServerError(context, "Error checking your user permissions on flow", err)
		return
	}
	if !canModify {
		httperror.Unauthorized(context, "You are not allowed to make modifications on this flow", errors.New("unauthorized"))
		return
	}

	flow.UpdatedAt = time.Now()

	// Map JSON keys to DB columns
	jsonToCol := map[string]string{
		"type":                     "type",
		"name":                     "name",
		"description":              "description",
		"project_id":               "project_id",
		"folder_id":                "folder_id",
		"runner_id":                "runner_id",
		"schedule_every_value":     "schedule_every_value",
		"schedule_every_unit":      "schedule_every_unit",
		"group_alerts":             "group_alerts",
		"group_alerts_identifier":  "group_alerts_identifier",
		"alert_threshold":          "alert_threshold",
		"always_cleanup_workspace": "always_cleanup_workspace",
		"patterns":                 "patterns",
		"exec_parallel":            "exec_parallel",
		"use_dag":                  "use_dag",
		"failure_pipeline_id":      "failure_pipeline_id",
	}

	columns := []string{"updated_at"}
	for jsonKey, dbCol := range jsonToCol {
		if _, ok := inputMap[jsonKey]; ok {
			columns = append(columns, dbCol)
		}
	}

	_, err = db.NewUpdate().Model(&flow).Column(columns...).Where("id = ?", flowID).Exec(context)
	if err != nil {
		httperror.InternalServerError(context, "Error updating flow on db", err)
		return
	}

	// Audit
	auditName := flowDB.Name
	if val, ok := inputMap["name"]; ok {
		auditName = val.(string)
	}

	err = functions_project.CreateAuditEntry(checkProjectID, "update", "Flow updated: "+auditName, db, context)
	if err != nil {
		log.Error(err)
	}

	context.JSON(http.StatusCreated, gin.H{"result": "success"})
}
