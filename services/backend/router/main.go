package router

import (
	"time"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/uptrace/bun"

	log "github.com/sirupsen/logrus"
)

func StartRouter(db *bun.DB) {
	gin.SetMode(gin.ReleaseMode)
	router := gin.Default()

	router.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"https://exflow.org", "http://localhost:3000"},
		AllowMethods:     []string{"GET", "HEAD", "POST", "PUT", "OPTIONS", "DELETE"},
		AllowHeaders:     []string{"Origin", "Authorization", "X-Requested-With", "Content-Type"},
		ExposeHeaders:    []string{"Content-Length"},
		AllowCredentials: true,
		MaxAge:           12 * time.Hour,
	}))

	v1 := router.Group("/api/v1")
	{
		Admin(v1, db)
		Auth(v1, db)
		Folders(v1, db)
		Executions(v1, db)
		Flows(v1, db)
		Page(v1, db)
		Projects(v1, db)
		Runners(v1, db)
		Token(v1, db)
		User(v1, db)
		Health(v1)
	}

	log.Info("Starting Router on port 8080")

	router.Run(":8080")
}
