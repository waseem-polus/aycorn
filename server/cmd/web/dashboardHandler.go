package main

import (
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
	projects, err := app.projectRepo.All(false)
	if err != nil {
		respondErr(w, err)
		return
	}

	writeJSON(w, http.StatusOK, dashboard{
		Projects:       projects,
		ActiveProjects: statistic{5, 25},
		CompletedTasks: statistic{112, 12},
		PriorityTasks:  statistic{4, 33},
		OnTimeTasks:    statistic{70, 15},
	})
}
