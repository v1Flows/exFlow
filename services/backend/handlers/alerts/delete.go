package alerts

import (
	"errors"
	"net/http"

	"github.com/v1Flows/exFlow/services/backend/functions/gatekeeper"
	"github.com/v1Flows/exFlow/services/backend/functions/httperror"
	"github.com/v1Flows/exFlow/services/backend/pkg/models"

	"github.com/gin-gonic/gin"
	_ "github.com/lib/pq"
	"github.com/uptrace/bun"
)

func Delete(context *gin.Context, db *bun.DB) {
	alertID := context.Param("alertID")

	// get flow_id from alert
	var alert models.Alerts
	err := db.NewSelect().Model(&alert).Where("id = ?", alertID).Scan(context)
	if err != nil {
		httperror.InternalServerError(context, "Error collecting alert data from db", err)
		return
	}

	// get project_id from flow_id
	var flow models.Flows
	err = db.NewSelect().Model(&flow).Where("id = ?", alert.FlowID).Scan(context)
	if err != nil {
		httperror.InternalServerError(context, "Error collecting flow data from db", err)
		return
	}

	// check the requestors role in project
	canModify, err := gatekeeper.CheckRequestUserProjectModifyRole(flow.ProjectID, context, db)
	if err != nil {
		httperror.InternalServerError(context, "Error checking your user permissions on project", err)
		return
	}
	if !canModify {
		httperror.Unauthorized(context, "You are not allowed to delete this alert", errors.New("unauthorized"))
		return
	}

	// delete all alerts which got this alert id as parent_id
	_, err = db.NewDelete().Model((*models.Alerts)(nil)).Where("parent_id = ?", alertID).Exec(context)
	if err != nil {
		httperror.InternalServerError(context, "Error deleting alert on db", err)
		return
	}

	_, err = db.NewDelete().Model((*models.Alerts)(nil)).Where("id = ?", alertID).Exec(context)
	if err != nil {
		httperror.InternalServerError(context, "Error deleting alert on db", err)
		return
	}

	context.JSON(http.StatusOK, gin.H{"result": "success"})
}
