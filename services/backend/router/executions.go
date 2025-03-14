package router

import (
	"github.com/v1Flows/exFlow/services/backend/handlers/executions"
	"github.com/v1Flows/exFlow/services/backend/middlewares"

	"github.com/gin-gonic/gin"
	"github.com/uptrace/bun"
)

func Executions(router *gin.RouterGroup, db *bun.DB) {
	execution := router.Group("/executions").Use(middlewares.Mixed(db))
	{
		execution.GET("/", func(c *gin.Context) {
			executions.GetExecutions(c, db)
		})

		execution.GET("/:executionID", func(c *gin.Context) {
			executions.GetExecution(c, db)
		})
		execution.PUT("/:executionID", func(c *gin.Context) {
			executions.Update(c, db)
		})
		execution.DELETE("/:executionID", func(c *gin.Context) {
			executions.DeleteExecution(c, db)
		})

		// steps
		execution.GET("/:executionID/steps", func(c *gin.Context) {
			executions.GetSteps(c, db)
		})
		execution.POST("/:executionID/steps", func(c *gin.Context) {
			executions.CreateStep(c, db)
		})

		// step
		execution.GET("/:executionID/steps/:stepID", func(c *gin.Context) {
			executions.GetStep(c, db)
		})
		execution.PUT("/:executionID/steps/:stepID", func(c *gin.Context) {
			executions.UpdateStep(c, db)
		})
	}
}
