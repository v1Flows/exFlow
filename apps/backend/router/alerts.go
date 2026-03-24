package router

import (
	"github.com/JustLABv1/justflow/apps/backend/handlers/alerts"
	"github.com/JustLABv1/justflow/apps/backend/middlewares"

	"github.com/gin-gonic/gin"
	"github.com/uptrace/bun"
)

func Alerts(router *gin.RouterGroup, db *bun.DB) {
	alert := router.Group("/alerts").Use(middlewares.Mixed(db))
	{
		alert.GET("/", func(c *gin.Context) {
			alerts.GetMultiple(c, db)
		})
		alert.GET("/grouped", func(c *gin.Context) {
			alerts.GetGrouped(c, db)
		})
		alert.GET("/:alertID", func(c *gin.Context) {
			alerts.GetSingle(c, db)
		})

		alert.POST("/", func(c *gin.Context) {
			alerts.CreateAlert(c, db)
		})
		alert.PUT("/:alertID", func(c *gin.Context) {
			alerts.Update(c, db)
		})
		alert.DELETE("/:alertID", func(c *gin.Context) {
			alerts.Delete(c, db)
		})
	}
}
