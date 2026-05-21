package main

import (
	"database/sql"
	"fmt"
	"net"
	"os"
	"path/filepath"
	"strconv"

	_ "github.com/mattn/go-sqlite3"
	"github.com/pressly/goose/v3"
	"github.com/waseem-polus/aycorn/server/internal/migrations"
	"github.com/waseem-polus/aycorn/server/internal/models/repos"
	"github.com/waseem-polus/aycorn/server/internal/models/services"
)

// version is set at build time via -ldflags "-X main.version=<tag>".
// Falls back to "dev" for local builds without a tag.
var version = "dev"

type app struct {
	projectRepo   *repos.ProjectRepo
	checklistRepo *repos.ChecklistRepo
	workflowRepo  *repos.WorkflowRepo
	stageRepo     *repos.StageRepo

	projectService   *services.ProjectService
	checklistService *services.ChecklistService
	taskService      *services.TaskService
	workflowService  *services.WorkflowService
	stageService     *services.StageService
}

// resolveDBPath returns the SQLite file path.
//
// Precedence:
//  1. --db <path> CLI flag
//  2. $AYCORN_DB env var
//  3. <os.UserConfigDir()>/aycorn/app.db — the default for installed binaries.
//     macOS:   ~/Library/Application Support/aycorn/app.db
//     Linux:   ~/.config/aycorn/app.db   (or $XDG_CONFIG_HOME/aycorn/app.db)
//     Windows: %AppData%\aycorn\app.db
func resolveDBPath() (string, error) {
	args := os.Args[1:]
	for i, arg := range args {
		if arg == "--db" && i+1 < len(args) && args[i+1] != "" {
			return args[i+1], nil
		}
	}
	if p := os.Getenv("AYCORN_DB"); p != "" {
		return p, nil
	}
	cfgDir, err := os.UserConfigDir()
	if err != nil {
		return "", err
	}
	dir := filepath.Join(cfgDir, "aycorn")
	if err := os.MkdirAll(dir, 0o755); err != nil {
		return "", err
	}
	return filepath.Join(dir, "app.db"), nil
}

// resolvePort returns the port to listen on.
//
// Precedence:
//  1. --port <n> CLI flag
//  2. $AYCORN_PORT env var
//  3. Default: 8000
func resolvePort() int {
	args := os.Args[1:]
	for i, arg := range args {
		if arg == "--port" && i+1 < len(args) {
			if p, err := strconv.Atoi(args[i+1]); err == nil && p > 0 {
				return p
			}
		}
	}
	if p, err := strconv.Atoi(os.Getenv("AYCORN_PORT")); err == nil && p > 0 {
		return p
	}
	return 8000
}

// findAvailablePort tries to bind to startPort, then startPort+1, …, up to 10
// attempts. Returns the bound listener and the port it landed on.
func findAvailablePort(startPort int) (net.Listener, int, error) {
	for port := startPort; port < startPort+10; port++ {
		ln, err := net.Listen("tcp", fmt.Sprintf(":%d", port))
		if err == nil {
			return ln, port, nil
		}
	}
	return nil, 0, fmt.Errorf("no available port found in range %d–%d; use --port or $AYCORN_PORT to choose a different one", startPort, startPort+9)
}

// setupDB opens the SQLite database and runs all pending goose migrations.
func setupDB(dbPath string) (*sql.DB, error) {
	db, err := sql.Open("sqlite3", dbPath+"?_foreign_keys=on")
	if err != nil {
		return nil, err
	}
	goose.SetBaseFS(migrations.Files)
	if err := goose.SetDialect("sqlite3"); err != nil {
		db.Close()
		return nil, err
	}
	if err := goose.Up(db, "sql"); err != nil {
		db.Close()
		return nil, err
	}
	return db, nil
}

// newApp wires up all repositories and services from an open database.
func newApp(db *sql.DB) app {
	projectRepo := &repos.ProjectRepo{DB: db}
	checklistRepo := &repos.ChecklistRepo{DB: db}
	taskRepo := &repos.TaskRepo{DB: db}
	workflowRepo := &repos.WorkflowRepo{DB: db}
	stageRepo := &repos.StageRepo{DB: db}

	projectService := &services.ProjectService{
		ProjectRepo:   projectRepo,
		TaskRepo:      taskRepo,
		ChecklistRepo: checklistRepo,
		WorkflowRepo:  workflowRepo,
		StageRepo:     stageRepo,
	}
	checklistService := &services.ChecklistService{
		ChecklistRepo: checklistRepo,
		TaskRepo:      taskRepo,
	}
	taskService := &services.TaskService{TaskRepo: taskRepo}
	workflowService := &services.WorkflowService{
		WorkflowRepo: workflowRepo,
		ProjectRepo:  projectRepo,
		StageRepo:    stageRepo,
	}
	stageService := &services.StageService{StageRepo: stageRepo}

	return app{
		projectRepo:   projectRepo,
		checklistRepo: checklistRepo,
		workflowRepo:  workflowRepo,
		stageRepo:     stageRepo,

		projectService:   projectService,
		checklistService: checklistService,
		taskService:      taskService,
		workflowService:  workflowService,
		stageService:     stageService,
	}
}
