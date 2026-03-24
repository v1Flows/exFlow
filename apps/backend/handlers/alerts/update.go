package alerts

import (
	"errors"
	"net/http"
	"time"

	"github.com/JustLABv1/justflow/apps/backend/functions/encryption"
	"github.com/JustLABv1/justflow/apps/backend/functions/gatekeeper"
	"github.com/JustLABv1/justflow/apps/backend/functions/httperror"
	"github.com/JustLABv1/justflow/apps/backend/pkg/models"

	"github.com/gin-gonic/gin"
	_ "github.com/lib/pq"
	"github.com/uptrace/bun"
)

func Update(context *gin.Context, db *bun.DB) {
	alertID := context.Param("alertID")

	var alert models.Alerts
	if err := context.ShouldBindJSON(&alert); err != nil {
		httperror.StatusBadRequest(context, "Error parsing incoming data", err)
		return
	}

	var alertDB models.Alerts
	err := db.NewSelect().Model(&alertDB).Where("id = ?", alertID).Scan(context)
	if err != nil {
		httperror.InternalServerError(context, "Error collecting alert data from db", err)
		return
	}

	// get project_id from flow_id
	var flow models.Flows
	err = db.NewSelect().Model(&flow).Where("id = ?", alertDB.FlowID).Scan(context)
	if err != nil {
		httperror.InternalServerError(context, "Error collecting flow data from db", err)
		return
	}

	// get project data
	var project models.Projects
	err = db.NewSelect().Model(&project).Where("id = ?", flow.ProjectID).Scan(context)
	if err != nil {
		httperror.InternalServerError(context, "Error collecting project data from db", err)
		return
	}

	access, err := gatekeeper.CheckUserProjectAccess(flow.ProjectID, context, db)
	if err != nil {
		httperror.InternalServerError(context, "Error checking your user permissions on project", err)
		return
	}
	if !access {
		httperror.Unauthorized(context, "You are not allowed to view this alert", errors.New("unauthorized"))
		return
	}

	alert.UpdatedAt = time.Now()
	columns := []string{}
	if alert.Name != "" {
		columns = append(columns, "name")
	}
	if alert.FlowID != "" {
		columns = append(columns, "flow_id")
	}
	if len(alert.Payload) != 0 {
		columns = append(columns, "payload")

		if project.EncryptionEnabled {
			alert.Payload, err = encryption.EncryptPayload(alert.Payload, project.ID.String(), db)
			if err != nil {
				httperror.InternalServerError(context, "Error encrypting payload", err)
				return
			}
			alert.Encrypted = true
			columns = append(columns, "encrypted")
		}
	}
	if alert.Status != alertDB.Status {
		columns = append(columns, "status")
	}
	if alert.ResolvedAt != alertDB.ResolvedAt {
		columns = append(columns, "resolved_at")
	}
	if alert.ParentID != alertDB.ParentID {
		columns = append(columns, "parent_id")
	}
	if alert.UpdatedAt != alertDB.UpdatedAt {
		columns = append(columns, "updated_at")
	}

	_, err = db.NewUpdate().Model(&alert).Column(columns...).Where("id = ?", alertID).Exec(context)
	if err != nil {
		httperror.InternalServerError(context, "Error updating alert on db", err)
		return
	}

	context.JSON(http.StatusOK, gin.H{"alert": alert})
}
