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

	projectService   *services.ProjectService
	checklistService *services.ChecklistService
}

func main() {
	db, err := sql.Open("sqlite3", "./app.db")
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

	projectService := &services.ProjectService{
		ProjectRepo:   projectRepo,
		ChecklistRepo: checklistRepo,
	}
	checklistService := &services.ChecklistService{
		ChecklistRepo: checklistRepo,
		TaskRepo:      taskRepo,
	}

	app := app{
		projectRepo:   projectRepo,
		checklistRepo: checklistRepo,

		projectService:   projectService,
		checklistService: checklistService,
	}

	port := ":8000"
	server := http.Server{
		Addr:    port,
		Handler: app.routes(),
	}

	log.Printf("Listening on %s", port)
	server.ListenAndServe()
}
