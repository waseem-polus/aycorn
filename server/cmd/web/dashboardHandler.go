package main

import (
	"encoding/json"
	"log"
	"net/http"

	"github.com/waseem-polus/aycorn/server/internal/models"
)

type dashboard struct {
	Projects       []models.Project
	ActiveProjects statistic
	CompletedTasks statistic
	PriorityTasks  statistic
	OnTimeTasks    statistic
}

type statistic struct {
	Value int
	Trend int
}

func (app *app) getDashboard(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Access-Control-Allow-Origin", "*")
	log.Println(r.RequestURI)

	projects, err := app.projectRepo.All()
	if err != nil {
		http.Error(w, err.Error(), 500)
		return
	}

	res, err := json.Marshal(dashboard{
		Projects:       projects,
		ActiveProjects: statistic{5, 25},
		CompletedTasks: statistic{112, 12},
		PriorityTasks:  statistic{4, 33},
		OnTimeTasks:    statistic{70, 15},
	})
	if err != nil {
		http.Error(w, err.Error(), 500)
		return
	}

	w.Write(res)
}
