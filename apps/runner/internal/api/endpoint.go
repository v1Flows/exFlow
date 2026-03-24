package api

import (
	"io"
	"strconv"

	"github.com/JustLABv1/justflow/pkg/contracts"
	"github.com/JustLABv1/runner/config"
	"github.com/JustLABv1/runner/pkg/executions"
	"github.com/JustLABv1/runner/pkg/plugins"
	"github.com/google/uuid"

	"github.com/gin-gonic/gin"
	log "github.com/sirupsen/logrus"
)

func RegisterEndpoints(loadedPluginEndpoints []models.Plugin) (endpoints []models.Endpoint) {
	for _, plugin := range loadedPluginEndpoints {
		endpoints = append(endpoints, plugin.Endpoint)
	}

	if len(endpoints) == 0 {
		endpoints = []models.Endpoint{}
	}

	return endpoints
}

func InitRouter(cfg *config.Config, router *gin.Engine, endpointPlugins []models.Plugin, loadedPlugins map[string]plugins.Plugin) {
	// enable api endpoint for backend -> runner communication
	log.Info("Router Listening on Port: ", cfg.ApiEndpoint.Port)
	v1 := router.Group("/api/v1")

	exGroup := v1.Group("/executions").Use(Auth())
	exGroup.POST("/:executionID/cancel", func(c *gin.Context) {
		executionID := c.Param("executionID")
		log.Info("Received Cancel Request for Execution ID: ", executionID)

		// Locate the execution
		execution, err := executions.GetExecutionByID(nil, executionID)
		if err != nil {
			log.Error("Execution not found: ", err)
			c.JSON(404, gin.H{"error": "Execution not found"})
			return
		}

		// Locate the current step of the execution
		steps, err := executions.GetSteps(nil, executionID)
		if err != nil {
			log.Error("Failed to get steps: ", err)
			c.JSON(500, gin.H{"error": "Failed to get steps"})
			return
		}

		var currentStep models.ExecutionSteps
		for _, step := range steps {
			if step.Status == "running" || step.Status == "pending" || step.Status == "paused" || step.Status == "interactionWaiting" {
				currentStep = step
				break
			}
		}
		if currentStep.ID == uuid.Nil {
			log.Error("No running step found for execution: ", executionID)
			c.JSON(404, gin.H{"error": "No running step found"})
			return
		}

		// Locate the plugin responsible for the current step
		plugin, ok := loadedPlugins[currentStep.Action.Plugin]
		if !ok {
			log.Error("Plugin not found for action: ", currentStep.Action.Plugin)
			c.JSON(500, gin.H{"error": "Plugin not found"})
			return
		}

		// Call the CancelTask method of the plugin
		cancelReq := plugins.CancelTaskRequest{
			Step: currentStep,
		}
		resp, err := plugin.CancelTask(cancelReq)
		if err != nil {
			log.Error("Failed to cancel task: ", err)
			c.JSON(500, gin.H{"error": "Failed to cancel task"})
			return
		}

		if !resp.Success {
			log.Error("Failed to cancel task: ", resp.Data)
			c.JSON(500, gin.H{"error": "Failed to cancel task"})
			return
		}

		// Update the execution to "canceled"
		execution.Status = "canceled"
		err = executions.UpdateExecution(nil, execution)
		if err != nil {
			log.Error("Failed to update execution status: ", err)
			c.JSON(500, gin.H{"error": "Failed to update execution status"})
			return
		}

		log.Info("Execution canceled successfully: ", executionID)
		c.JSON(200, gin.H{"message": "Execution canceled successfully"})
	})

	if cfg.Mode == "listener" || cfg.Mode == "master" {
		log.Info("Open Alert Port: ", cfg.ApiEndpoint.Port)

		alert := v1.Group("/alert")
		for _, plugin := range endpointPlugins {
			log.Infof("Open %s Endpoint at /api/v1/alert%s", plugin.Name, plugin.Endpoint.Path)
			alert.POST(plugin.Endpoint.Path, func(c *gin.Context) {
				log.Info("Received Alert for: ", plugin.Name)

				bodyBytes, err := io.ReadAll(c.Request.Body)
				if err != nil {
					log.Error("Error reading request body: ", err)
					c.JSON(500, gin.H{
						"error": "Error reading request body",
					})
					return
				}

				request := plugins.EndpointRequest{
					Config: cfg,
					Body:   bodyBytes,
				}

				res, err := loadedPlugins[plugin.Endpoint.ID].EndpointRequest(request)
				if err != nil {
					log.Error("Error in handling request: ", err)
					c.JSON(500, gin.H{
						"error": err,
					})
				} else {
					log.Info("Request handled successfully")
					c.JSON(200, gin.H{
						"response": res,
					})
				}
			})
		}
	}

	router.Run(":" + strconv.Itoa(cfg.ApiEndpoint.Port))
}
