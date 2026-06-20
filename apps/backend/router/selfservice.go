package router

import (
	"github.com/JustLABv1/justflow/apps/backend/handlers/selfservice"
	"github.com/JustLABv1/justflow/apps/backend/middlewares"

	"github.com/gin-gonic/gin"
	"github.com/uptrace/bun"
)

func SelfService(router *gin.RouterGroup, db *bun.DB) {
	ss := router.Group("/self-service").Use(middlewares.Mixed(db))
	{
		// List all accessible pages (requires auth)
		ss.GET("/", func(c *gin.Context) { selfservice.GetPages(c, db) })

		// Get single page by ID or slug (requires project membership)
		ss.GET("/:slugOrID", func(c *gin.Context) { selfservice.GetPage(c, db) })

		// Execute a flow from a page (requires project membership)
		ss.POST("/:slugOrID/execute/:flowID", func(c *gin.Context) { selfservice.Execute(c, db) })
	}

	// Management endpoints: editor or admin role required
	ssManage := router.Group("/self-service").Use(middlewares.Editor(db))
	{
		ssManage.POST("/", func(c *gin.Context) { selfservice.CreatePage(c, db) })
		ssManage.PUT("/:pageID", func(c *gin.Context) { selfservice.UpdatePage(c, db) })
		ssManage.DELETE("/:pageID", func(c *gin.Context) { selfservice.DeletePage(c, db) })
	}
}
