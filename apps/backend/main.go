package main

import (
	"context"
	"os"
	"os/signal"
	"strings"
	"syscall"
	"time"

	"github.com/JustLABv1/justflow/services/backend/config"
	"github.com/JustLABv1/justflow/services/backend/database"
	"github.com/JustLABv1/justflow/services/backend/functions/background_checks"
	"github.com/JustLABv1/justflow/services/backend/functions/encryption"
	"github.com/JustLABv1/justflow/services/backend/pkg/telemetry"
	"github.com/JustLABv1/justflow/services/backend/router"

	"github.com/alecthomas/kingpin/v2"
	log "github.com/sirupsen/logrus"
)

const version string = "2.0.0-beta.16"

var (
	configFile    = kingpin.Flag("config", "Config file").Short('c').Default(getEnv("JUSTFLOW_CONFIG", "/etc/justflow/config.yaml")).String()
	frontendEnv   = kingpin.Flag("frontendEnv", "Path to frontend environment").Default(getEnv("JUSTFLOW_FRONTEND_ENV", "/etc/justflow/.env")).String()
	otelCollector = kingpin.Flag("otel-collector", "OpenTelemetry Collector URL").Default(getEnv("JUSTFLOW_OTEL_COLLECTOR", "tempo:4317")).String()
)

// getEnv returns the value of the environment variable if set, otherwise returns the default value.
func getEnv(key, defaultVal string) string {
	if val := os.Getenv(key); val != "" {
		return val
	}
	return defaultVal
}

func logging(cfg *config.RestfulConf) {
	// Set log format
	if strings.ToLower(cfg.Logging.Format) == "json" {
		log.SetFormatter(&log.JSONFormatter{})
	} else {
		log.SetFormatter(&log.TextFormatter{
			FullTimestamp: true,
		})
	}

	// Set log level
	switch strings.ToLower(cfg.Logging.Level) {
	case "info":
		log.SetLevel(log.InfoLevel)
	case "warn":
		log.SetLevel(log.WarnLevel)
	case "error":
		log.SetLevel(log.ErrorLevel)
	case "debug":
		log.SetLevel(log.DebugLevel)
	default:
		log.SetLevel(log.InfoLevel)
	}
}

func main() {
	kingpin.Version(version)
	kingpin.HelpFlag.Short('h')
	kingpin.Parse()

	log.Info("Starting JustFlow API. Version: ", version)

	// Check if this is a restarted process
	if os.Getenv("JUSTFLOW_RESTARTED") == "1" {
		log.Info("Application restarted after setup completion")
	}

	// Check if config file exists
	if _, err := os.Stat(*configFile); os.IsNotExist(err) {
		log.Info("Config file not found, starting in setup mode")
		startSetupMode(*configFile, *frontendEnv)
		return
	}

	log.Info("Loading Config File: ", *configFile)
	err := config.GetInstance().LoadConfig(*configFile)
	if err != nil {
		log.Error("Failed to load config file, starting in setup mode: ", err)
		startSetupMode(*configFile, *frontendEnv)
		return
	}

	cfg := config.Config
	log.Info("Config loaded successfully")

	logging(cfg)

	// Initialize OpenTelemetry
	shutdown, err := telemetry.InitTracer(context.Background(), "justflow-backend", *otelCollector)
	if err != nil {
		log.Warn("Failed to initialize OpenTelemetry tracer: ", err)
	} else {
		defer func() {
			if err := shutdown(context.Background()); err != nil {
				log.Error("Failed to shutdown OpenTelemetry tracer: ", err)
			}
		}()
		log.Info("OpenTelemetry tracer initialized")
	}

	db := database.StartDatabase(cfg.Database.Driver, cfg.Database.Server, cfg.Database.Port, cfg.Database.User, cfg.Database.Password, cfg.Database.Name)
	if db == nil {
		log.Fatal("Failed to connect to the database")
	}

	telemetry.RegisterDBMetrics(db)
	telemetry.InitAppMetrics(db)

	err = encryption.MigrateProjectsEncryption(cfg.Encryption.Key, db)
	if err != nil {
		log.Fatal("Failed to migrate projects: ", err)
	}

	go background_checks.Init(db)

	// Set up signal handling for graceful shutdown
	server := router.StartRouter(db, cfg.Port, *configFile, *frontendEnv)

	// Wait for interrupt signal to gracefully shutdown the server
	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
	<-quit
	log.Info("Shutting down server...")

	// The server has 30 seconds to finish the request it is currently handling
	ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
	defer cancel()
	if err := server.Shutdown(ctx); err != nil {
		log.Fatal("Server forced to shutdown:", err)
	}

	log.Info("Server exited")
}

func startSetupMode(configFile string, frontendEnv string) {
	log.Info("Starting in setup mode - limited functionality available")
	logging(&config.RestfulConf{
		Logging: config.LoggingConf{
			Level:  "info",
			Format: "json",
		},
	}) // Default to info level logging in setup mode

	// Start router in setup mode (without database connection)
	server := router.StartSetupRouter(8080, configFile, frontendEnv) // Default port for setup

	// Wait for interrupt signal to gracefully shutdown the server
	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
	<-quit
	log.Info("Shutting down setup server...")

	// The server has 30 seconds to finish the request it is currently handling
	ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
	defer cancel()
	if err := server.Shutdown(ctx); err != nil {
		log.Fatal("Setup server forced to shutdown:", err)
	}

	log.Info("Setup server exited")
}
