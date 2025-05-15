package admins

import (
	"net/http"

	"github.com/v1Flows/exFlow/services/backend/functions/httperror"
	"github.com/v1Flows/exFlow/services/backend/pkg/models"

	"github.com/gin-gonic/gin"
	_ "github.com/lib/pq"
	"github.com/uptrace/bun"
)

func GetUsers(context *gin.Context, db *bun.DB) {
	var users []models.Users
	err := db.NewSelect().Model(&users).ExcludeColumn("password").Scan(context)
	if err != nil {
		httperror.InternalServerError(context, "Error collecting users on db", err)
		return
	}

	context.JSON(http.StatusOK, gin.H{"users": users})
}
