package flows

import (
	"errors"
	"net/http"

	"github.com/v1Flows/exFlow/services/backend/config"
	"github.com/v1Flows/exFlow/services/backend/functions/auth"
	"github.com/v1Flows/exFlow/services/backend/functions/encryption"
	"github.com/v1Flows/exFlow/services/backend/functions/gatekeeper"
	"github.com/v1Flows/exFlow/services/backend/functions/httperror"
	"github.com/v1Flows/exFlow/services/backend/pkg/models"

	"github.com/gin-gonic/gin"
	_ "github.com/lib/pq"
	"github.com/uptrace/bun"
)

func GetFlow(context *gin.Context, db *bun.DB) {
	flowID := context.Param("flowID")

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

	// decrypt action params
	tokenString := context.GetHeader("Authorization")
	tokenType, err := auth.GetTypeFromToken(tokenString)
	if err != nil {
		httperror.InternalServerError(context, "Error receiving token type", err)
		return
	}

	var decryptPasswords bool
	if tokenType == "user" || tokenType == "service" {
		decryptPasswords = false
	} else {
		decryptPasswords = true
	}

	if config.Config.Encryption.Enabled && flow.EncryptActionParams && len(flow.Actions) > 0 {
		flow.Actions, err = encryption.DecryptParams(flow.Actions, decryptPasswords)
		if err != nil {
			httperror.InternalServerError(context, "Error decrypting action params", err)
			return
		}
	}

	context.JSON(http.StatusOK, gin.H{"flow": flow})
}
