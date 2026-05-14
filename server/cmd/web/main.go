package main

import (
	"database/sql"
	"log"
	"net/http"

	_ "github.com/mattn/go-sqlite3"
	"github.com/waseem-polus/aycorn/server/internal/models/repos"
	"github.com/waseem-polus/aycorn/server/internal/models/services"
)

type app struct {
	projectRepo   *repos.ProjectRepo
	checklistRepo *repos.ChecklistRepo
	workflowRepo  *repos.WorkflowRepo

	projectService   *services.ProjectService
	checklistService *services.ChecklistService
	taskService      *services.TaskService
	workflowService  *services.WorkflowService
}

func main() {
	db, err := sql.Open("sqlite3", "./app.db?_foreign_keys=on")
	if err != nil {
		log.Fatal(err)
	}

	projectRepo := &repos.ProjectRepo{
		DB: db,
	}
	checklistRepo := &repos.ChecklistRepo{
		DB: db,
	}
	taskRepo := &repos.TaskRepo{
		DB: db,
	}
	workflowRepo := &repos.WorkflowRepo{
		DB: db,
	}

	projectService := &services.ProjectService{
		ProjectRepo:   projectRepo,
		TaskRepo:      taskRepo,
		ChecklistRepo: checklistRepo,
		WorkflowRepo:  workflowRepo,
	}
	checklistService := &services.ChecklistService{
		ChecklistRepo: checklistRepo,
		TaskRepo:      taskRepo,
	}

	taskService := &services.TaskService{
		TaskRepo: taskRepo,
	}

	workflowService := &services.WorkflowService{
		WorkflowRepo: workflowRepo,
		ProjectRepo:  projectRepo,
	}

	app := app{
		projectRepo:   projectRepo,
		checklistRepo: checklistRepo,
		workflowRepo:  workflowRepo,

		projectService:   projectService,
		checklistService: checklistService,
		taskService:      taskService,
		workflowService:  workflowService,
	}

	port := ":8000"
	server := http.Server{
		Addr:    port,
		Handler: app.routes(),
	}

	log.Printf("Listening on %s", port)
	server.ListenAndServe()
	db.Close()
}
