package main

import (
	"context"
	"os"
	"os/signal"
	"strings"
	"syscall"
	"time"

	"github.com/v1Flows/exFlow/services/backend/config"
	"github.com/v1Flows/exFlow/services/backend/database"
	"github.com/v1Flows/exFlow/services/backend/functions/background_checks"
	"github.com/v1Flows/exFlow/services/backend/functions/encryption"
	"github.com/v1Flows/exFlow/services/backend/router"

	"github.com/alecthomas/kingpin/v2"
	log "github.com/sirupsen/logrus"
)

const version string = "2.0.0"

var (
	configFile = kingpin.Flag("config", "Config file").Short('c').Default("config.yaml").String()
)

func logging(logLevel string) {
	logLevel = strings.ToLower(logLevel)

	switch logLevel {
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

	log.Info("Starting exFlow API. Version: ", version)

	// Check if this is a restarted process
	if os.Getenv("EXFLOW_RESTARTED") == "1" {
		log.Info("Application restarted after setup completion")
	}

	// Check if config file exists
	if _, err := os.Stat(*configFile); os.IsNotExist(err) {
		log.Info("Config file not found, starting in setup mode")
		startSetupMode()
		return
	}

	log.Info("Loading Config File: ", *configFile)
	err := config.GetInstance().LoadConfig(*configFile)
	if err != nil {
		log.Error("Failed to load config file, starting in setup mode: ", err)
		startSetupMode()
		return
	}

	cfg := config.Config
	log.Info("Config loaded successfully")

	logging(cfg.LogLevel)

	db := database.StartDatabase(cfg.Database.Driver, cfg.Database.Server, cfg.Database.Port, cfg.Database.User, cfg.Database.Password, cfg.Database.Name)
	if db == nil {
		log.Fatal("Failed to connect to the database")
	}

	err = encryption.MigrateProjectsEncryption(cfg.Encryption.Key, db)
	if err != nil {
		log.Fatal("Failed to migrate projects: ", err)
	}

	go background_checks.Init(db)

	// Set up signal handling for graceful shutdown
	server := router.StartRouter(db, cfg.Port)

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

func startSetupMode() {
	log.Info("Starting in setup mode - limited functionality available")
	logging("info") // Default to info level logging in setup mode

	// Start router in setup mode (without database connection)
	server := router.StartSetupRouter(8081) // Default port for setup

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
