package main

import (
	"os"
	"os/signal"
	"strings"
	"syscall"
	"time"

	"github.com/JustLABv1/justflow/pkg/contracts"
	"github.com/JustLABv1/runner/config"
	"github.com/JustLABv1/runner/internal/api"
	internal_executions "github.com/JustLABv1/runner/internal/executions"
	"github.com/JustLABv1/runner/internal/runner"
	"github.com/JustLABv1/runner/internal/worker"
	"github.com/JustLABv1/runner/pkg/plugins"
	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/sirupsen/logrus"

	"github.com/alecthomas/kingpin/v2"
)

var (
	log        = logrus.New()
	version    = "2.0.0-beta.3"
	configFile = kingpin.Flag("config", "Path to configuration file").Short('c').String()
)

func logging(logLevel string) {
	logLevel = strings.ToLower(logLevel)

	if logLevel == "info" {
		log.SetLevel(logrus.InfoLevel)
	} else if logLevel == "warn" {
		log.SetLevel(logrus.WarnLevel)
	} else if logLevel == "error" {
		log.SetLevel(logrus.ErrorLevel)
	} else if logLevel == "debug" {
		log.SetLevel(logrus.DebugLevel)
	} else {
		log.SetLevel(logrus.InfoLevel)
	}
}

func main() {
	kingpin.Version(version)
	kingpin.HelpFlag.Short('h')
	kingpin.Parse()

	log.Info("Starting JustLAB Runner. Version: ", version)

	log.Info("Loading config")
	configManager := config.GetInstance()
	err := configManager.LoadConfig(*configFile)
	if err != nil {
		log.Fatalf("Failed to load configuration: %v", err)
	}

	cfg := configManager.GetConfig()

	logging(cfg.LogLevel)

	loadedPlugins, modelPlugins, actionPlugins, endpointPlugins := plugins.Init(cfg)

	actions := internal_executions.RegisterActions(actionPlugins)

	// RunnerID might have changed after registration, so fetch the config again
	cfg = configManager.GetConfig()

	gin.SetMode(gin.ReleaseMode)
	router := gin.Default()

	router.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"https://justflow.app", "http://localhost:8080", "http://localhost:3000", "http://localhost:4000", "http://localhost:8081"},
		AllowMethods:     []string{"GET", "HEAD", "POST", "PUT", "OPTIONS", "DELETE"},
		AllowHeaders:     []string{"Origin", "Authorization", "X-Requested-With", "Content-Type"},
		ExposeHeaders:    []string{"Content-Length"},
		AllowCredentials: true,
		MaxAge:           12 * time.Hour,
	}))

	endpoints := api.RegisterEndpoints(endpointPlugins)
	log.Info("Register at exFlow...")
	runner.RegisterAtAPI(version, modelPlugins, actions, endpoints)
	go runner.SendHeartbeat()
	Init(cfg, router, actions, endpointPlugins, loadedPlugins)

	go api.ReadyEndpoint(cfg, router)

	// Handle graceful shutdown
	sigs := make(chan os.Signal, 1)
	signal.Notify(sigs, syscall.SIGINT, syscall.SIGTERM)
	<-sigs

	log.Info("Shutting down...")
	plugins.ShutdownPlugins()
	log.Info("Shutdown complete")
}

func Init(cfg *config.Config, router *gin.Engine, actions []models.Action, endpointPlugins []models.Plugin, loadedPlugins map[string]plugins.Plugin) {
	switch strings.ToLower(cfg.Mode) {
	case "master":
		log.Info("Runner is in Master Mode")
		log.Info("Starting Execution Checker")
		go worker.StartWorker(actions, loadedPlugins)
		log.Info("Starting Router")
		go api.InitRouter(cfg, router, endpointPlugins, loadedPlugins)
	case "worker":
		log.Info("Runner is in Worker Mode")
		log.Info("Starting Execution Checker")
		go worker.StartWorker(actions, loadedPlugins)
	case "listener":
		log.Info("Runner is in Listener Mode")
		log.Info("Starting Router")
		go api.InitRouter(cfg, router, endpointPlugins, loadedPlugins)
	}
}
