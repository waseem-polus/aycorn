package main

import (
	"encoding/json"
	"net/http"
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
