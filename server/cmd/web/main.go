package main

import (
	"database/sql"
	"log"
	"net/http"

	_ "github.com/mattn/go-sqlite3"
	"github.com/pressly/goose/v3"
	"github.com/waseem-polus/aycorn/server/internal/migrations"
	"github.com/waseem-polus/aycorn/server/internal/models/repos"
	"github.com/waseem-polus/aycorn/server/internal/models/services"
)

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
	db, err := sql.Open("sqlite3", "./app.db?_foreign_keys=on")
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
