package router

import (
	"github.com/gin-gonic/gin"
)

func Health(router *gin.RouterGroup) {
	router.GET("/health", func(c *gin.Context) {
		c.JSON(200, gin.H{"status": "ok"})
	})
}
