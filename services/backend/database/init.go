package database

import (
	"context"
	"database/sql"
	"runtime"
	"strconv"

	"github.com/uptrace/bun"
	"github.com/uptrace/bun/dialect/pgdialect"
	"github.com/uptrace/bun/driver/pgdriver"
	"github.com/uptrace/bun/extra/bunotel"
	"github.com/uptrace/bun/migrate"

	_ "github.com/mattn/go-sqlite3"

	"github.com/v1Flows/exFlow/services/backend/database/migrations"

	log "github.com/sirupsen/logrus"
)

func StartPostgres(dbServer string, dbPort int, dbUser string, dbPass string, dbName string) *bun.DB {
	log.Info("Connecting to PostgreSQL database...")

	pgconn := pgdriver.NewConnector(
		pgdriver.WithAddr(dbServer+":"+strconv.Itoa(dbPort)),
		pgdriver.WithUser(dbUser),
		pgdriver.WithPassword(dbPass),
		pgdriver.WithDatabase(dbName),
		pgdriver.WithApplicationName("exflow"),
		pgdriver.WithTLSConfig(nil),
	)

	sqldb := sql.OpenDB(pgconn)
	db := bun.NewDB(sqldb, pgdialect.New(), bun.WithDiscardUnknownColumns())
	db.AddQueryHook(bunotel.NewQueryHook(bunotel.WithDBName(dbName)))

	maxOpenConns := 4 * runtime.GOMAXPROCS(0)
	db.SetMaxOpenConns(maxOpenConns)
	db.SetMaxIdleConns(maxOpenConns)

	// Create a new migrator
	migrator := migrate.NewMigrator(db, migrations.Migrations)

	// Run migrations
	ctx := context.Background()
	if err := migrator.Init(ctx); err != nil {
		log.Fatal(err)
	}

	if err := migrator.Lock(ctx); err != nil {
		log.Fatal(err)
	}
	defer migrator.Unlock(ctx)

	group, err := migrator.Migrate(ctx)
	if err != nil {
		log.Fatal(err)
	}

	log.Info("Database connected successfully")

	if group.ID == 0 {
		log.Info("No migrations to run.")
	} else {
		log.Infof("Migrated to %s\n", group)
	}

	createDefaultSettings(db)

	return db
}

func StartDatabase(dbDriver string, dbServer string, dbPort int, dbUser, dbPass, dbName string) *bun.DB {
	log.Info("Starting database connection...")
	switch dbDriver {
	case "postgres":
		return StartPostgres(dbServer, dbPort, dbUser, dbPass, dbName)
	default:
		log.Fatalf("Unsupported database type: %s", dbDriver)
		return nil
	}
}
