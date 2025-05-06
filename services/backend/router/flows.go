package router

import (
	"github.com/v1Flows/exFlow/services/backend/handlers/flows"
	"github.com/v1Flows/exFlow/services/backend/middlewares"

	"github.com/gin-gonic/gin"
	"github.com/uptrace/bun"
)

func Flows(router *gin.RouterGroup, db *bun.DB) {
	flow := router.Group("/flows").Use(middlewares.Mixed(db))
	{
		// flows
		flow.GET("/", func(c *gin.Context) {
			flows.GetFlows(c, db)
		})
		flow.POST("/", func(c *gin.Context) {
			flows.CreateFlow(c, db)
		})

		// flow
		flow.GET("/:flowID", func(c *gin.Context) {
			flows.GetFlow(c, db)
		})
		flow.GET("/:flowID/stats", func(c *gin.Context) {
			flows.GetStats(c, db)
		})
		flow.PUT("/:flowID", func(c *gin.Context) {
			flows.UpdateFlow(c, db)
		})
		flow.DELETE("/:flowID", func(c *gin.Context) {
			flows.DeleteFlow(c, db)
		})
		flow.PUT("/:flowID/maintenance", func(c *gin.Context) {
			flows.ChangeFlowMaintenance(c, db)
		})

		// actions
		flow.POST("/:flowID/actions", func(c *gin.Context) {
			flows.AddFlowActions(c, db)
		})
		flow.PUT("/:flowID/actions", func(c *gin.Context) {
			flows.UpdateFlowActions(c, db)
		})
		flow.PUT("/:flowID/actions/details", func(c *gin.Context) {
			flows.UpdateFlowActionsDetails(c, db)
		})
		flow.DELETE("/:flowID/actions/:actionID", func(c *gin.Context) {
			flows.DeleteFlowAction(c, db)
		})

		// failure pipelines
		flow.POST("/:flowID/failure-pipelines", func(c *gin.Context) {
			flows.AddFlowFailurePipelines(c, db)
		})
		flow.PUT("/:flowID/failure-pipelines", func(c *gin.Context) {
			flows.UpdateFlowFailurePipelines(c, db)
		})
		flow.DELETE("/:flowID/failure-pipelines/:failurePipelineID", func(c *gin.Context) {
			flows.DeleteFlowFailurePipelines(c, db)
		})

		// failure pipeline action
		flow.POST("/:flowID/failure-pipelines/:failurePipelineID/actions", func(c *gin.Context) {
			flows.AddFlowFailurePipelineActions(c, db)
		})
		flow.PUT("/:flowID/failure-pipelines/:failurePipelineID/actions", func(c *gin.Context) {
			flows.UpdateFlowFailurePipelineActions(c, db)
		})
		flow.DELETE("/:flowID/failure-pipelines/:failurePipelineID/actions/:actionID", func(c *gin.Context) {
			flows.DeleteFlowFailurePipelineAction(c, db)
		})

		// executions
		flow.GET("/:flowID/executions", func(c *gin.Context) {
			flows.GetFlowExecutions(c, db)
		})
	}
}
