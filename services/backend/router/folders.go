package router

import (
	"github.com/v1Flows/exFlow/services/backend/handlers/folders"
	"github.com/v1Flows/exFlow/services/backend/middlewares"

	"github.com/gin-gonic/gin"
	"github.com/uptrace/bun"
)

func Folders(router *gin.RouterGroup, db *bun.DB) {
	folder := router.Group("/folders").Use(middlewares.Auth(db))
	{
		// folders
		folder.GET("/", func(c *gin.Context) {
			folders.GetFolders(c, db)
		})
		folder.POST("/", func(c *gin.Context) {
			folders.CreateFolder(c, db)
		})

		// flow
		folder.GET("/:folderID", func(c *gin.Context) {
			folders.GetFolder(c, db)
		})
	}
}
