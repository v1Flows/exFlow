package router

import (
	"github.com/gin-gonic/gin"
	"github.com/v1Flows/exFlow/services/backend/handlers/setup"
)

func Setup(rg *gin.RouterGroup, configFile string, frontendEnv string) {
	setupGroup := rg.Group("/setup")
	{
		setupGroup.POST("/configure", func(c *gin.Context) {
			setup.SetupSystem(c, configFile, frontendEnv)
		})
		setupGroup.GET("/status", setup.CheckSetupStatus)
		setupGroup.POST("/validate", setup.ValidateSetupData)
		setupGroup.POST("/restart", setup.RestartApplication)
	}
}
