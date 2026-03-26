package selfservice

import (
	"net/http"

	"github.com/JustLABv1/justflow/apps/backend/functions/auth"
	"github.com/JustLABv1/justflow/apps/backend/functions/gatekeeper"
	"github.com/JustLABv1/justflow/apps/backend/functions/httperror"
	"github.com/JustLABv1/justflow/apps/backend/pkg/models"

	"github.com/gin-gonic/gin"
	"github.com/uptrace/bun"
)

func GetPages(context *gin.Context, db *bun.DB) {
	tokenString := context.GetHeader("Authorization")
	tokenType, err := auth.GetTypeFromToken(tokenString)
	if err != nil {
		httperror.InternalServerError(context, "Error receiving token type", err)
		return
	}

	var pages []models.SelfServicePage

	if tokenType == "user" {
		userID, err := auth.GetUserIDFromToken(tokenString)
		if err != nil {
			httperror.InternalServerError(context, "Error receiving userID from token", err)
			return
		}

		isAdmin, err := gatekeeper.CheckAdmin(userID, db)
		if err != nil {
			httperror.InternalServerError(context, "Error checking user role", err)
			return
		}

		if isAdmin {
			// Admins see all pages
			err = db.NewSelect().Model(&pages).OrderExpr("created_at DESC").Scan(context)
		} else {
			// Regular users and editors see pages from their projects
			err = db.NewSelect().Model(&pages).
				Where(`project_id::uuid IN (
					SELECT project_id::uuid FROM project_members
					WHERE user_id = ? AND invite_pending = FALSE
				)`, userID).
				OrderExpr("created_at DESC").
				Scan(context)
		}
	} else {
		// Service/project tokens: return all pages
		err = db.NewSelect().Model(&pages).OrderExpr("created_at DESC").Scan(context)
	}

	if err != nil {
		httperror.InternalServerError(context, "Error fetching self-service pages", err)
		return
	}

	if pages == nil {
		pages = []models.SelfServicePage{}
	}

	context.JSON(http.StatusOK, gin.H{"pages": pages})
}
