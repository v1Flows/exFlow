package router

import (
	"github.com/JustLABv1/justflow/services/backend/handlers/setup"
	"github.com/gin-gonic/gin"
)

func Setup(rg *gin.RouterGroup, configFile string, frontendEnv string) {
	setupGroup := rg.Group("/setup")
	{
		setupGroup.POST("/configure", func(c *gin.Context) {
			setup.SetupSystem(c, configFile, frontendEnv)
		})
		setupGroup.GET("/status", func(c *gin.Context) {
			setup.CheckSetupStatus(c, configFile, frontendEnv)
		})
		setupGroup.POST("/validate", setup.ValidateSetupData)
		setupGroup.POST("/restart", setup.RestartApplication)
	}
}
