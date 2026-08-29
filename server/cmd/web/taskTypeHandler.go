package main

import (
	"encoding/json"
	"net/http"
	"strconv"

	"github.com/waseem-polus/aycorn/server/internal/models"
)

func (app *app) getAllTaskTypes(w http.ResponseWriter, r *http.Request) {
	filter := r.URL.Query().Get("filter")
	types, err := app.taskTypeService.GetAll(filter)
	if err != nil {
		respondErr(w, err)
		return
	}
	writeJSON(w, http.StatusOK, types)
}

func (app *app) postTaskType(w http.ResponseWriter, r *http.Request) {
	defer r.Body.Close()

	tt := models.TaskType{}
	if err := json.NewDecoder(r.Body).Decode(&tt); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	created, err := app.taskTypeService.Create(&tt)
	if err != nil {
		respondErr(w, err)
		return
	}
	writeJSON(w, http.StatusOK, created)
}

func (app *app) putTaskType(w http.ResponseWriter, r *http.Request) {
	defer r.Body.Close()

	id, err := strconv.Atoi(r.PathValue("id"))
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	tt := models.TaskType{}
	if err := json.NewDecoder(r.Body).Decode(&tt); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}
	tt.ID = id

	ok, err := app.taskTypeService.Update(&tt)
	if err != nil {
		respondErr(w, err)
		return
	}
	writeJSON(w, http.StatusOK, ok)
}

func (app *app) deleteTaskType(w http.ResponseWriter, r *http.Request) {
	defer r.Body.Close()

	id, err := strconv.Atoi(r.PathValue("id"))
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	body := struct {
		TransferTypeID int `json:"transferTypeId"`
	}{}
	if err := json.NewDecoder(r.Body).Decode(&body); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	if err := app.taskTypeService.Delete(id, body.TransferTypeID); err != nil {
		respondErr(w, err)
		return
	}
	writeJSON(w, http.StatusOK, true)
}

func (app *app) bulkUpdateTaskTypes(w http.ResponseWriter, r *http.Request) {
	defer r.Body.Close()

	body := struct {
		IDs     []int          `json:"ids"`
		Changes map[string]any `json:"changes"`
	}{}
	if err := json.NewDecoder(r.Body).Decode(&body); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	result, err := app.taskTypeService.BulkUpdate(body.IDs, body.Changes)
	if err != nil {
		respondErr(w, err)
		return
	}
	writeJSON(w, http.StatusOK, result)
}

func (app *app) bulkDeleteTaskTypes(w http.ResponseWriter, r *http.Request) {
	defer r.Body.Close()

	body := struct {
		IDs          []int          `json:"ids"`
		TaskMappings map[string]int `json:"taskMappings"`
	}{}
	if err := json.NewDecoder(r.Body).Decode(&body); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	mappings := map[int]int{}
	for k, v := range body.TaskMappings {
		id, err := strconv.Atoi(k)
		if err != nil {
			http.Error(w, err.Error(), http.StatusBadRequest)
			return
		}
		mappings[id] = v
	}

	result, err := app.taskTypeService.BulkDelete(body.IDs, mappings)
	if err != nil {
		respondErr(w, err)
		return
	}
	writeJSON(w, http.StatusOK, result)
}

// getProjectTaskTypes lists the types the project's tasks already use, for the
// project's type filters. Every type is usable in every project.
func (app *app) getProjectTaskTypes(w http.ResponseWriter, r *http.Request) {
	projectId, err := strconv.Atoi(r.PathValue("projectId"))
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	types, err := app.taskTypeService.GetInUseForProject(projectId)
	if err != nil {
		respondErr(w, err)
		return
	}
	writeJSON(w, http.StatusOK, types)
}
