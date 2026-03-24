package admins

import (
	"github.com/JustLABv1/justflow/apps/backend/functions/httperror"
	"github.com/JustLABv1/justflow/apps/backend/pkg/models"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/uptrace/bun"
)

func UpdateToken(context *gin.Context, db *bun.DB) {
	tokenID := context.Param("tokenID")

	var token models.Tokens
	if err := context.ShouldBindJSON(&token); err != nil {
		httperror.StatusBadRequest(context, "Error parsing incoming data", err)
		return
	}

	_, err := db.NewUpdate().Model(&token).Column("description", "disabled", "disabled_reason").Where("id = ?", tokenID).Exec(context)
	if err != nil {
		httperror.InternalServerError(context, "Error updating token informations on db", err)
	}

	context.JSON(http.StatusCreated, gin.H{"result": "success"})
}
