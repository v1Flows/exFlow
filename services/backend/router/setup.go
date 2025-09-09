package router

import (
	"github.com/gin-gonic/gin"
	"github.com/v1Flows/exFlow/services/backend/handlers/setup"
)

func Setup(rg *gin.RouterGroup) {
	setupGroup := rg.Group("/setup")
	{
		setupGroup.POST("/configure", setup.SetupSystem)
		setupGroup.GET("/status", setup.CheckSetupStatus)
		setupGroup.POST("/validate", setup.ValidateSetupData)
		setupGroup.POST("/restart", setup.RestartApplication)
	}
}
