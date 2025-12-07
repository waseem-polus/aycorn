package main

import (
	"encoding/json"
	"net/http"
	"strconv"
)

func (app *app) getDashboard(w http.ResponseWriter, r *http.Request) {
	projects, err := app.projects.All()
	if err != nil {
		http.Error(w, err.Error(), 500)
		return
	}

	res, err := json.Marshal(projects)
	if err != nil {
		http.Error(w, err.Error(), 500)
		return
	}

	w.Write(res)
}

func (app *app) getProject(w http.ResponseWriter, r *http.Request) {
	projectId, err := strconv.Atoi(r.PathValue("projectId"))
	if err != nil {
		http.Error(w, err.Error(), 500)
		return
	}

	project, err := app.projects.FindOne(projectId)
	if err != nil {
		w.Write(nil)
		return
	}

	res, err := json.Marshal(project)
	if err != nil {
		http.Error(w, err.Error(), 500)
		return
	}

	w.Write(res)
}
