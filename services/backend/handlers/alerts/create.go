package alerts

import (
	"errors"
	"net/http"
	"time"

	"github.com/v1Flows/exFlow/services/backend/functions/encryption"
	functions "github.com/v1Flows/exFlow/services/backend/functions/flow"
	"github.com/v1Flows/exFlow/services/backend/functions/gatekeeper"
	"github.com/v1Flows/exFlow/services/backend/functions/httperror"
	"github.com/v1Flows/exFlow/services/backend/pkg/models"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	_ "github.com/lib/pq"
	"github.com/uptrace/bun"

	log "github.com/sirupsen/logrus"
)

func CreateAlert(context *gin.Context, db *bun.DB) {
	var alert models.Alerts
	if err := context.ShouldBindJSON(&alert); err != nil {
		httperror.StatusBadRequest(context, "Error parsing incoming data", err)
		return
	}

	var flow models.Flows
	flowCount, err := db.NewSelect().Model(&flow).Where("id = ?", alert.FlowID).ScanAndCount(context)
	if err != nil {
		httperror.InternalServerError(context, "Error collecting flow data from db", err)
		return
	}
	if flowCount == 0 {
		httperror.StatusNotFound(context, "Error no flow found", err)
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

	alert.ID = uuid.New()
	alert.CreatedAt = time.Now()

	// encrypt payload if enabled
	if project.EncryptionEnabled {
		alert.Payload, err = encryption.EncryptPayload(alert.Payload, project.ID.String(), db)
		if err != nil {
			httperror.InternalServerError(context, "Error encrypting payload", err)
			return
		}
		alert.Encrypted = true
	}

	res, err := db.NewInsert().Model(&alert).ExcludeColumn("execution_id").Exec(context)
	if err != nil {
		httperror.InternalServerError(context, "Error creating alert on db", err)
		return
	}

	// if the alert has a parent_id we need to update the parent alert updated_at time
	if alert.ParentID != "" {
		parentAlert := models.Alerts{}
		parentAlert.UpdatedAt = time.Now()
		if alert.Status == "resolved" {
			parentAlert.Status = "resolved"
			_, err := db.NewUpdate().Model(&parentAlert).Where("id = ?", alert.ParentID).Column("updated_at", "status").Exec(context)
			if err != nil {
				httperror.InternalServerError(context, "Error updating parent alert on db", err)
				return
			}
		} else {
			_, err := db.NewUpdate().Model(&parentAlert).Where("id = ?", alert.ParentID).Column("updated_at").Exec(context)
			if err != nil {
				httperror.InternalServerError(context, "Error updating parent alert on db", err)
				return
			}
		}
	}

	err = functions.PreStartExecution(alert.FlowID, flow, db, alert)
	if err != nil {
		log.Error("Failed to start execution: " + err.Error())
		httperror.InternalServerError(context, "Failed to start execution", err)
	}

	context.JSON(http.StatusCreated, gin.H{"result": "success", "response": res})
}
