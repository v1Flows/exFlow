package flows

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

func DeleteAlert(context *gin.Context, db *bun.DB) {
	alertID := context.Param("alertID")

	// get alert data from db
	var alert models.Alerts
	err := db.NewSelect().Model(&alert).Where("id = ?", alertID).Scan(context)
	if err != nil {
		httperror.InternalServerError(context, "Error collecting alert data from db", err)
		return
	}

	// get flow data
	var flow models.Flows
	err = db.NewSelect().Model(&flow).Where("id = ?", alert.FlowID).Scan(context)
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

	// check the requestors role in project
	canModify, err := gatekeeper.CheckRequestUserProjectModifyRole(flow.ProjectID, context, db)
	if err != nil {
		httperror.InternalServerError(context, "Error checking your user permissions on flow", err)
		return
	}
	if !canModify {
		httperror.Unauthorized(context, "You are not allowed to make modifications on this flow", errors.New("unauthorized"))
		return
	}

	_, err = db.NewDelete().Model((*models.Alerts)(nil)).Where("id = ?", alertID).Exec(context)
	if err != nil {
		httperror.InternalServerError(context, "Error deleting alert from db", err)
		return
	}

	context.JSON(http.StatusOK, gin.H{"result": "success"})
}
