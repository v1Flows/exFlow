package router

import (
	"net/http"
	"strconv"
	"time"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/prometheus/client_golang/prometheus/promhttp"
	"github.com/uptrace/bun"
	"go.opentelemetry.io/contrib/instrumentation/github.com/gin-gonic/gin/otelgin"

	"github.com/JustLABv1/justflow/services/backend/middlewares"
	log "github.com/sirupsen/logrus"
)

func StartRouter(db *bun.DB, port int, configFile string, frontendEnv string) *http.Server {
	gin.SetMode(gin.ReleaseMode)
	router := gin.New()
	router.Use(gin.Recovery())
	router.Use(otelgin.Middleware("justflow-backend"))
	router.Use(middlewares.PrometheusMiddleware())
	router.Use(func(c *gin.Context) {
		start := time.Now()
		c.Next()
		latency := time.Since(start)
		status := c.Writer.Status()
		log.WithFields(log.Fields{
			"status":    status,
			"method":    c.Request.Method,
			"path":      c.Request.URL.Path,
			"latency":   latency,
			"client_ip": c.ClientIP(),
		}).Info("HTTP request")
	})

	router.GET("/metrics", gin.WrapH(promhttp.Handler()))

	router.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"*"},
		AllowMethods:     []string{"GET", "HEAD", "POST", "PUT", "OPTIONS", "DELETE"},
		AllowHeaders:     []string{"Origin", "Authorization", "X-Requested-With", "Content-Type"},
		ExposeHeaders:    []string{"Content-Length"},
		AllowCredentials: false,
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
		Alerts(v1, db)
		Projects(v1, db)
		Runners(v1, db)
		Token(v1, db)
		User(v1, db)
		Health(v1)
		Setup(v1, configFile, frontendEnv)
	}

	server := &http.Server{
		Addr:    ":" + strconv.Itoa(port),
		Handler: router,
	}

	go func() {
		log.Info("Starting Router on port ", strconv.Itoa(port))
		if err := server.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			log.Fatalf("Failed to start server: %v\n", err)
		}
	}()

	return server
}

// StartSetupRouter starts a minimal router for setup mode (no database required)
func StartSetupRouter(port int, configFile string, frontendEnv string) *http.Server {
	gin.SetMode(gin.ReleaseMode)
	router := gin.Default()
	router.Use(middlewares.PrometheusMiddleware())
	router.GET("/metrics", gin.WrapH(promhttp.Handler()))

	router.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"https://justlab.xyz", "http://localhost:3000", "http://localhost:4000"},
		AllowMethods:     []string{"GET", "HEAD", "POST", "PUT", "OPTIONS", "DELETE"},
		AllowHeaders:     []string{"Origin", "Authorization", "X-Requested-With", "Content-Type"},
		ExposeHeaders:    []string{"Content-Length"},
		AllowCredentials: true,
		MaxAge:           12 * time.Hour,
	}))

	v1 := router.Group("/api/v1")
	{
		// Only enable setup and health endpoints in setup mode
		Health(v1)
		Setup(v1, configFile, frontendEnv)
	}

	server := &http.Server{
		Addr:    ":" + strconv.Itoa(port),
		Handler: router,
	}

	go func() {
		log.Info("Starting Setup Router on port ", strconv.Itoa(port))
		if err := server.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			log.Fatalf("Failed to start setup server: %v\n", err)
		}
	}()

	return server
}
