package main

import (
	"strings"

	"github.com/v1Flows/exFlow/services/backend/config"
	"github.com/v1Flows/exFlow/services/backend/database"
	"github.com/v1Flows/exFlow/services/backend/functions/background_checks"
	"github.com/v1Flows/exFlow/services/backend/router"

	"github.com/alecthomas/kingpin/v2"
	log "github.com/sirupsen/logrus"
)

const version string = "1.1.1"

var (
	configFile = kingpin.Flag("config", "Config file").Short('c').Default("config.yaml").String()
)

func logging(logLevel string) {
	logLevel = strings.ToLower(logLevel)

	if logLevel == "info" {
		log.SetLevel(log.InfoLevel)
	} else if logLevel == "warn" {
		log.SetLevel(log.WarnLevel)
	} else if logLevel == "error" {
		log.SetLevel(log.ErrorLevel)
	} else if logLevel == "debug" {
		log.SetLevel(log.DebugLevel)
	} else {
		log.SetLevel(log.InfoLevel)
	}
}

func main() {
	kingpin.Version(version)
	kingpin.HelpFlag.Short('h')
	kingpin.Parse()

	log.Info("Starting exFlow API. Version: ", version)

	log.Info("Loading Config File: ", *configFile)
	err := config.GetInstance().LoadConfig(*configFile)
	if err != nil {
		panic(err)
	}

	cfg := config.Config
	log.Info("Config loaded successfully")

	log.Info(cfg.LogLevel)

	logging(cfg.LogLevel)

	db := database.StartDatabase(cfg.Database.Driver, cfg.Database.Server, cfg.Database.Port, cfg.Database.User, cfg.Database.Password, cfg.Database.Name)
	if db == nil {
		log.Fatal("Failed to connect to the database")
	}

	go background_checks.Init(db)
	router.StartRouter(db, cfg.Port)
}
