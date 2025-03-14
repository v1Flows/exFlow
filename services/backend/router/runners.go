package router

import (
	"github.com/v1Flows/exFlow/services/backend/handlers/executions"
	"github.com/v1Flows/exFlow/services/backend/handlers/runners"
	"github.com/v1Flows/exFlow/services/backend/middlewares"

	"github.com/gin-gonic/gin"
	"github.com/uptrace/bun"
)

func Runners(router *gin.RouterGroup, db *bun.DB) {
	runner := router.Group("/runners").Use(middlewares.Runner(db))
	{
		runner.GET("/", func(c *gin.Context) {
			runners.GetRunners(c, db)
		})
		runner.POST("/", func(c *gin.Context) {
			runners.CreateRunner(c, db)
		})

		runner.PUT("/:runnerID", func(c *gin.Context) {
			runners.EditRunner(c, db)
		})
		runner.DELETE("/:runnerID", func(c *gin.Context) {
			runners.DeleteRunner(c, db)
		})

		runner.GET("/:runnerID/flows/links", func(c *gin.Context) {
			runners.GetRunnerFlowLinks(c, db)
		})

		// Runner Access Endpoints
		runner.GET("/:runnerID/executions/pending", func(c *gin.Context) {
			executions.GetPendingExecutions(c, db)
		})
		runner.PUT("/register", func(c *gin.Context) {
			runners.RegisterRunner(c, db)
		})
		runner.PUT("/:runnerID/heartbeat", func(c *gin.Context) {
			runners.Hearbeat(c, db)
		})
		runner.PUT("/:runnerID/busy", func(c *gin.Context) {
			runners.Busy(c, db)
		})
		runner.PUT("/:runnerID/actions", func(c *gin.Context) {
			runners.SetRunnerActions(c, db)
		})
		runner.PUT("/:runnerID/alert_endpoints", func(c *gin.Context) {
			runners.SetRunnerAlertEndpoints(c, db)
		})
	}
}
