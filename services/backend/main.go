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

const version string = "1.0.0-beta1"

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
	} else if logLevel == "degbug" {
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
	config, err := config.ReadConfig(*configFile)
	if err != nil {
		log.Fatal("Error loading config file: ", err)
	}

	logging(config.LogLevel)

	database := database.StartPostgres(config.Database.Server, config.Database.Port, config.Database.User, config.Database.Password, config.Database.Name)

	go background_checks.Init(database)
	router.StartRouter(database, config.Port)
}
