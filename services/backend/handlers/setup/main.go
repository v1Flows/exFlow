package setup

import (
	"crypto/rand"
	"database/sql"
	"encoding/base64"
	"fmt"
	"net/http"
	"net/url"
	"os"
	"os/exec"
	"strings"
	"syscall"
	"time"

	"github.com/gin-gonic/gin"
	_ "github.com/lib/pq" // PostgreSQL driver
	log "github.com/sirupsen/logrus"
	"gopkg.in/yaml.v3"
)

type SetupRequest struct {
	BackendURL  string        `json:"backend_url" binding:"required"`
	BackendPort int           `json:"backend_port" binding:"required"`
	Database    DatabaseSetup `json:"database" binding:"required"`
	FrontendURL string        `json:"frontend_url" binding:"required"`
}

type DatabaseSetup struct {
	Server   string `json:"server" binding:"required"`
	Port     int    `json:"port" binding:"required"`
	Name     string `json:"name" binding:"required"`
	User     string `json:"user" binding:"required"`
	Password string `json:"password" binding:"required"`
}

type BackendConfig struct {
	LogLevel   string           `yaml:"log_level"`
	Port       int              `yaml:"port"`
	Database   DatabaseConfig   `yaml:"database"`
	JWT        JWTConfig        `yaml:"jwt"`
	Encryption EncryptionConfig `yaml:"encryption"`
	Runner     RunnerConfig     `yaml:"runner"`
}

type DatabaseConfig struct {
	Server   string `yaml:"server"`
	Port     int    `yaml:"port"`
	Name     string `yaml:"name"`
	User     string `yaml:"user"`
	Password string `yaml:"password"`
}

type JWTConfig struct {
	Secret string `yaml:"secret"`
}

type EncryptionConfig struct {
	MasterSecret string `yaml:"master_secret"`
	Key          string `yaml:"key"`
}

type RunnerConfig struct {
	SharedRunnerSecret string `yaml:"shared_runner_secret"`
}

// generateRandomString generates a cryptographically secure random string of specified length
func generateRandomString(length int) (string, error) {
	bytes := make([]byte, length)
	_, err := rand.Read(bytes)
	if err != nil {
		return "", err
	}
	return base64.URLEncoding.EncodeToString(bytes)[:length], nil
}

// DatabaseValidationResult contains detailed database validation information
type DatabaseValidationResult struct {
	Connected      bool     `json:"connected"`
	TablesExist    bool     `json:"tables_exist"`
	TableCount     int      `json:"table_count"`
	ExistingTables []string `json:"existing_tables,omitempty"`
	IsEmpty        bool     `json:"is_empty"`
	Error          string   `json:"error,omitempty"`
	Warning        string   `json:"warning,omitempty"`
}

// validateDatabaseConnection tests the database connection and checks table status
func validateDatabaseConnection(server string, port int, name, user, password string) (*DatabaseValidationResult, error) {
	result := &DatabaseValidationResult{
		Connected:      false,
		TablesExist:    false,
		TableCount:     0,
		ExistingTables: []string{},
		IsEmpty:        true,
	}

	// Construct PostgreSQL connection string
	connStr := fmt.Sprintf("host=%s port=%d user=%s password=%s dbname=%s sslmode=disable",
		server, port, user, password, name)

	// Open connection
	db, err := sql.Open("postgres", connStr)
	if err != nil {
		result.Error = fmt.Sprintf("failed to create database connection: %v", err)
		return result, fmt.Errorf("failed to create database connection: %v", err)
	}
	defer db.Close()

	// Set connection timeout
	db.SetConnMaxLifetime(5 * time.Second)

	// Test the connection
	err = db.Ping()
	if err != nil {
		result.Error = fmt.Sprintf("failed to connect to database: %v", err)
		return result, fmt.Errorf("failed to connect to database: %v", err)
	}

	result.Connected = true

	// Check for existing tables
	query := `
		SELECT table_name 
		FROM information_schema.tables 
		WHERE table_schema = 'public' 
		AND table_type = 'BASE TABLE'
		ORDER BY table_name
	`

	rows, err := db.Query(query)
	if err != nil {
		result.Warning = fmt.Sprintf("could not check tables: %v", err)
		return result, nil // Connection works, but can't check tables
	}
	defer rows.Close()

	var tables []string
	for rows.Next() {
		var tableName string
		if err := rows.Scan(&tableName); err != nil {
			continue
		}
		tables = append(tables, tableName)
	}

	result.ExistingTables = tables
	result.TableCount = len(tables)
	result.TablesExist = len(tables) > 0
	result.IsEmpty = len(tables) == 0

	// Check if database is empty - if not, return an error
	if result.IsEmpty {
		result.Warning = "Database is empty - perfect for a fresh ExFlow installation"
		return result, nil
	} else {
		// Database contains tables - this is an error for setup
		result.Error = fmt.Sprintf("Database contains %d existing tables: %s. ExFlow setup requires an empty database.",
			len(tables), strings.Join(tables, ", "))
		return result, fmt.Errorf("database must be empty for setup - found %d existing tables", len(tables))
	}
}

// validateBackendURL tests if the backend URL is accessible and properly formatted
func validateBackendURL(backendURL string) error {
	// Parse the URL
	parsedURL, err := url.Parse(backendURL)
	if err != nil {
		return fmt.Errorf("invalid URL format: %v", err)
	}

	// Check if scheme is provided
	if parsedURL.Scheme == "" {
		return fmt.Errorf("URL must include scheme (http:// or https://)")
	}

	// Check if host is provided
	if parsedURL.Host == "" {
		return fmt.Errorf("URL must include host")
	}

	// For localhost URLs, we can't test connectivity from the backend to itself
	// since we're in setup mode, so just validate format
	if strings.Contains(parsedURL.Host, "localhost") || strings.Contains(parsedURL.Host, "127.0.0.1") {
		return nil
	}

	// For external URLs, test connectivity
	client := &http.Client{
		Timeout: 5 * time.Second,
	}

	resp, err := client.Get(backendURL + "/api/v1/health")
	if err != nil {
		// If health endpoint fails, just warn but don't fail setup
		log.Warn("Could not verify backend URL accessibility: ", err)
		return nil
	}
	defer resp.Body.Close()

	return nil
}

// SetupSystem handles the initial system setup
func SetupSystem(c *gin.Context, configFile string, frontendEnv string) {
	var req SetupRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Validate database connection
	log.Info("Validating database connection...")
	dbResult, err := validateDatabaseConnection(req.Database.Server, req.Database.Port, req.Database.Name, req.Database.User, req.Database.Password)
	if err != nil {
		log.Error("Database validation failed: ", err)
		c.JSON(http.StatusBadRequest, gin.H{
			"error":   fmt.Sprintf("Database connection failed: %v", err),
			"field":   "database",
			"details": dbResult,
		})
		return
	}

	if dbResult.Warning != "" {
		log.Warn("Database validation warning: ", dbResult.Warning)
	}

	log.Info("Database connection validated successfully")

	// Validate backend URL format
	log.Info("Validating backend URL...")
	if err := validateBackendURL(req.BackendURL); err != nil {
		log.Error("Backend URL validation failed: ", err)
		c.JSON(http.StatusBadRequest, gin.H{
			"error": fmt.Sprintf("Backend URL validation failed: %v", err),
			"field": "backend_url",
		})
		return
	}
	log.Info("Backend URL validated successfully")

	// Generate secure secrets
	jwtSecret, err := generateRandomString(64)
	if err != nil {
		log.Error("Failed to generate JWT secret: ", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to generate JWT secret"})
		return
	}

	masterSecret, err := generateRandomString(64)
	if err != nil {
		log.Error("Failed to generate master secret: ", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to generate master secret"})
		return
	}

	encryptionKey, err := generateRandomString(32)
	if err != nil {
		log.Error("Failed to generate encryption key: ", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to generate encryption key"})
		return
	}

	runnerSecret, err := generateRandomString(32)
	if err != nil {
		log.Error("Failed to generate runner secret: ", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to generate runner secret"})
		return
	}

	// Create backend config
	backendConfig := BackendConfig{
		LogLevel: "info",
		Port:     req.BackendPort,
		Database: DatabaseConfig{
			Server:   req.Database.Server,
			Port:     req.Database.Port,
			Name:     req.Database.Name,
			User:     req.Database.User,
			Password: req.Database.Password,
		},
		JWT: JWTConfig{
			Secret: jwtSecret,
		},
		Encryption: EncryptionConfig{
			MasterSecret: masterSecret,
			Key:          encryptionKey,
		},
		Runner: RunnerConfig{
			SharedRunnerSecret: runnerSecret,
		},
	}

	// Write backend config.yaml
	configData, err := yaml.Marshal(&backendConfig)
	if err != nil {
		log.Error("Failed to marshal backend config: ", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create backend config"})
		return
	}

	err = os.WriteFile(configFile, configData, 0600)
	if err != nil {
		log.Error("Failed to write backend config: ", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to write backend config"})
		return
	}

	// Create frontend .env file
	envContent := "NEXT_PUBLIC_API_URL=\"" + req.BackendURL + "\"\n"

	err = os.WriteFile(frontendEnv, []byte(envContent), 0644)
	if err != nil {
		log.Error("Failed to write frontend .env: ", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to write frontend config"})
		return
	}

	log.Info("System setup completed successfully")
	c.JSON(http.StatusOK, gin.H{
		"message":             "Setup completed successfully. Application will restart in full mode.",
		"backend_config_path": configFile,
		"frontend_env_path":   frontendEnv,
		"restart_required":    true,
	})

	// Restart the application in a goroutine to allow the response to be sent first
	go func() {
		log.Info("Restarting application in full mode...")
		RestartApplication(nil)
	}()
}

// CheckSetupStatus checks if the system has been set up
func CheckSetupStatus(c *gin.Context, configFile string, frontendEnv string) {
	backendConfigExists := false
	frontendEnvExists := false

	// Check if backend config exists
	if _, err := os.Stat(configFile); err == nil {
		backendConfigExists = true
	}

	// Check if frontend .env exists
	if _, err := os.Stat(frontendEnv); err == nil {
		frontendEnvExists = true
	}

	isSetup := backendConfigExists && frontendEnvExists

	c.JSON(http.StatusOK, gin.H{
		"is_setup":              isSetup,
		"backend_config_exists": backendConfigExists,
		"frontend_env_exists":   frontendEnvExists,
	})
}

// ValidateSetupData validates setup configuration without saving
func ValidateSetupData(c *gin.Context) {
	var req SetupRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	validationResults := gin.H{
		"database_valid":    false,
		"backend_url_valid": false,
		"validation_errors": []string{},
		"database_details":  nil,
	}

	// Validate database connection
	dbResult, err := validateDatabaseConnection(req.Database.Server, req.Database.Port, req.Database.Name, req.Database.User, req.Database.Password)
	if err != nil {
		validationResults["validation_errors"] = append(validationResults["validation_errors"].([]string), fmt.Sprintf("Database: %v", err))
		validationResults["database_details"] = dbResult
	} else {
		validationResults["database_valid"] = true
		validationResults["database_details"] = dbResult

		// Add warning as info message if present
		if dbResult.Warning != "" {
			validationResults["validation_errors"] = append(validationResults["validation_errors"].([]string), fmt.Sprintf("Database Info: %s", dbResult.Warning))
		}
	}

	// Validate backend URL
	if err := validateBackendURL(req.BackendURL); err != nil {
		validationResults["validation_errors"] = append(validationResults["validation_errors"].([]string), fmt.Sprintf("Backend URL: %v", err))
	} else {
		validationResults["backend_url_valid"] = true
	}

	allValid := validationResults["database_valid"].(bool) && validationResults["backend_url_valid"].(bool)
	validationResults["all_valid"] = allValid

	if allValid {
		c.JSON(http.StatusOK, validationResults)
	} else {
		c.JSON(http.StatusBadRequest, validationResults)
	}
}

// RestartApplication restarts the current application process
func RestartApplication(c *gin.Context) {
	if c != nil {
		c.JSON(http.StatusOK, gin.H{"message": "Application restarting..."})
	}

	log.Info("Restarting application...")

	// Get the current executable path
	executable, err := os.Executable()
	if err != nil {
		log.Error("Failed to get executable path: ", err)
		if c != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to restart application"})
		}
		return
	}

	// Get current process arguments
	args := os.Args[1:] // Exclude the program name

	// Create a new process
	cmd := exec.Command(executable, args...)

	// Set up environment for the new process
	cmd.Env = os.Environ()
	cmd.Env = append(cmd.Env, "EXFLOW_RESTARTED=1") // Flag to indicate this is a restarted process

	cmd.Stdout = os.Stdout
	cmd.Stderr = os.Stderr
	cmd.Stdin = os.Stdin

	// For development (go run), we need to stay in the same process group
	// so that Ctrl+C signals are properly forwarded
	// For production (compiled binary), we can use process groups
	isGoRun := strings.Contains(executable, "go-build") || strings.Contains(executable, "/tmp/")

	if !isGoRun {
		// Production mode - use separate process group for better isolation
		cmd.SysProcAttr = &syscall.SysProcAttr{
			Setpgid: true,
			Pgid:    0,
		}
		log.Info("Starting in production mode with separate process group")
	} else {
		// Development mode - inherit parent process group for signal forwarding
		log.Info("Starting in development mode (go run) - inheriting process group")
	}

	// Start the new process
	err = cmd.Start()
	if err != nil {
		log.Error("Failed to start new process: ", err)
		if c != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to restart application"})
		}
		return
	}

	log.Info("New process started with PID: ", cmd.Process.Pid)
	log.Info("Setup-initiated restart complete")

	// Terminate the current process gracefully
	os.Exit(0)
}
