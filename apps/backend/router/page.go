package router

import (
	"github.com/JustLABv1/justflow/apps/backend/handlers/pages"

	"github.com/gin-gonic/gin"
	"github.com/uptrace/bun"
)

func Page(router *gin.RouterGroup, db *bun.DB) {
	page := router.Group("/page")
	{
		page.GET("/settings", func(c *gin.Context) {
			pages.GetSettings(c, db)
		})
	}
}
