package router

import (
	"github.com/JustLABv1/justflow/services/backend/handlers/auths"
	"github.com/JustLABv1/justflow/services/backend/handlers/tokens"

	"github.com/gin-gonic/gin"
	"github.com/uptrace/bun"
)

func Auth(router *gin.RouterGroup, db *bun.DB) {
	auth := router.Group("/auth")
	{
		auth.POST("/login", func(c *gin.Context) {
			tokens.GenerateTokenUser(db, c)
		})
		auth.POST("/register", func(c *gin.Context) {
			auths.RegisterUser(c, db)
		})
		auth.POST("/user/taken", func(c *gin.Context) {
			auths.CheckUserTaken(c, db)
		})

		// OIDC endpoints
		oidc := auth.Group("/oidc")
		{
			// Start OIDC login flow
			oidc.GET("/authorize/:provider", auths.OIDCStartLogin(db))
			// Handle OIDC provider callback
			oidc.GET("/callback/:provider", auths.OIDCCallback(db))
			// List available OIDC providers
			oidc.GET("/providers", auths.OIDCListProviders())
		}
	}
}
