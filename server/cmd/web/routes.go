package main

import "net/http"

func (app *app) routes() http.Handler {
	mux := http.NewServeMux()

	mux.HandleFunc("OPTIONS /", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Access-Control-Allow-Origin", "*")
		w.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, POST, DELETE")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")
		w.WriteHeader(http.StatusNoContent)
	})
	mux.HandleFunc("GET /api/", app.getDashboard)

	mux.HandleFunc("GET /api/project", app.getAllProjects)
	mux.HandleFunc("GET /api/project/pinned", app.getPinnedProjects)
	mux.HandleFunc("GET /api/project/checklist/{projectId}", app.getProjectChecklists)

	mux.HandleFunc("GET /api/project/{projectId}", app.getProject)
	mux.HandleFunc("PUT /api/project/{projectId}", app.putProject)
	mux.HandleFunc("POST /api/project", app.postProject)

	mux.HandleFunc("GET /api/task/body/{taskId}", app.getTaskBody)
	mux.HandleFunc("POST /api/task", app.postTask)
	mux.HandleFunc("PUT /api/task", app.putTask)
	mux.HandleFunc("DELETE /api/task/{taskId}", app.deleteTask)

	mux.HandleFunc("POST /api/checklist/{projectId}", app.postChecklist)
	mux.HandleFunc("PUT /api/checklist", app.putChecklist)
	mux.HandleFunc("DELETE /api/checklist/{checklistId}", app.deleteChecklist)

	return mux
}
