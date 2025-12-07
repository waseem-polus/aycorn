package main

import "net/http"

func (app *app) routes() http.Handler {
	mux := http.NewServeMux()

	mux.HandleFunc("GET /api/", app.getDashboard)

	mux.HandleFunc("GET /api/project/{projectId}", app.getProject)

	return mux
}
