package main

import (
	"context"
	"database/sql"
	"fmt"
	"log"
	"net"
	"net/http"
	"os"
	"os/signal"
	"path/filepath"
	"strconv"
	"syscall"
	"time"

	_ "github.com/mattn/go-sqlite3"
	"github.com/pressly/goose/v3"
	"github.com/waseem-polus/aycorn/server/internal/migrations"
	"github.com/waseem-polus/aycorn/server/internal/models/repos"
	"github.com/waseem-polus/aycorn/server/internal/models/services"
)

// version is set at build time via -ldflags "-X main.version=<tag>".
// Falls back to "dev" for local builds without a tag.
var version = "dev"

// resolveDBPath returns the SQLite file path.
//
// Precedence:
//  1. $AYCORN_DB — explicit override (used by `make dev` and for ad-hoc testing
//     so dev builds don't clobber an installed user DB).
//  2. <os.UserConfigDir()>/aycorn/app.db — the default for installed binaries.
//     macOS:   ~/Library/Application Support/aycorn/app.db
//     Linux:   ~/.config/aycorn/app.db   (or $XDG_CONFIG_HOME/aycorn/app.db)
//     Windows: %AppData%\aycorn\app.db
func resolveDBPath() (string, error) {
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

func main() {
	if len(os.Args) > 1 && (os.Args[1] == "--version" || os.Args[1] == "version") {
		fmt.Println(version)
		os.Exit(0)
	}

	dbPath, err := resolveDBPath()
	if err != nil {
		log.Fatal(err)
	}
	log.Printf("Using database at %s", dbPath)
	db, err := sql.Open("sqlite3", dbPath+"?_foreign_keys=on")
	if err != nil {
		log.Fatal(err)
	}
	defer db.Close()

	goose.SetBaseFS(migrations.Files)
	if err := goose.SetDialect("sqlite3"); err != nil {
		log.Fatal(err)
	}
	if err := goose.Up(db, "sql"); err != nil {
		log.Fatal(err)
	}

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

	app := app{
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

	ln, port, err := findAvailablePort(resolvePort())
	if err != nil {
		log.Fatal(err)
	}

	server := http.Server{Handler: app.routes()}

	// Start the server in a goroutine so we can listen for shutdown signals.
	go func() {
		log.Printf("Listening on http://localhost:%d", port)
		if err := server.Serve(ln); err != nil && err != http.ErrServerClosed {
			log.Fatal(err)
		}
	}()

	// Block until SIGINT (Ctrl-C) or SIGTERM (kill / make upgrade).
	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
	<-quit

	log.Println("Shutting down — waiting for in-flight requests to finish...")
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()
	if err := server.Shutdown(ctx); err != nil {
		log.Fatal("Forced shutdown:", err)
	}
	log.Println("Done")
}
