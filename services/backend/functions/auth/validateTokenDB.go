package auth

import (
	"errors"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"github.com/uptrace/bun"
	"github.com/v1Flows/exFlow/services/backend/functions/httperror"
	"github.com/v1Flows/exFlow/services/backend/pkg/models"
)

func ValidateTokenDBEntry(token string, db *bun.DB, ctx *gin.Context) (valid bool, err error) {
	var dbToken models.Tokens
	err = db.NewSelect().Model(&dbToken).Where("key = ?", token).Scan(ctx)
	if err != nil {
		httperror.InternalServerError(ctx, "Error receiving token from db", err)
		return false, err
	}

	if dbToken.ID == uuid.Nil {
		httperror.Unauthorized(ctx, "The provided token is not valid", errors.New("the provided token is not valid"))
		return false, err
	}

	if dbToken.Disabled {
		httperror.Unauthorized(ctx, "The provided token is disabled", errors.New("the provided token is disabled"))
		return false, err
	}

	return true, nil
}
