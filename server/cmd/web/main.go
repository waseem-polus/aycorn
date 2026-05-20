package main

import (
	"database/sql"
	"log"
	"net/http"
	"os"
	"path/filepath"

	_ "github.com/mattn/go-sqlite3"
	"github.com/pressly/goose/v3"
	"github.com/waseem-polus/aycorn/server/internal/migrations"
	"github.com/waseem-polus/aycorn/server/internal/models/repos"
	"github.com/waseem-polus/aycorn/server/internal/models/services"
)

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

	port := ":8000"
	server := http.Server{
		Addr:    port,
		Handler: app.routes(),
	}

	log.Printf("Listening on %s", port)
	server.ListenAndServe()
}
