package router

import (
	"github.com/v1Flows/exFlow/services/backend/handlers/tokens"

	"github.com/gin-gonic/gin"
	"github.com/uptrace/bun"
)

func Token(router *gin.RouterGroup, db *bun.DB) {
	token := router.Group("/token")
	{
		token.GET("/validate", func(c *gin.Context) {
			tokens.ValidateToken(c)
		})
		token.POST("/refresh", func(c *gin.Context) {
			tokens.RefreshToken(c, db)
		})
		token.GET("/service/validate", func(c *gin.Context) {
			tokens.ValidateServiceToken(c, db)
		})
		token.PUT("/:id", func(c *gin.Context) {
			tokens.UpdateToken(c, db)
		})
		token.DELETE("/runner/:apikey", func(c *gin.Context) {
			tokens.DeleteRunnerToken(c, db)
		})
	}
}
