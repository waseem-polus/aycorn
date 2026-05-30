package main

import (
	"encoding/json"
	"net/http"
	"strconv"

	"github.com/waseem-polus/aycorn/server/internal/models"
)

func (app *app) getAllTaskTypes(w http.ResponseWriter, r *http.Request) {
	types, err := app.taskTypeService.GetAll()
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

func (app *app) getProjectTaskTypes(w http.ResponseWriter, r *http.Request) {
	projectId, err := strconv.Atoi(r.PathValue("projectId"))
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	types, err := app.taskTypeService.GetEnabledForProject(projectId)
	if err != nil {
		respondErr(w, err)
		return
	}
	writeJSON(w, http.StatusOK, types)
}

func (app *app) getProjectTaskTypeSettings(w http.ResponseWriter, r *http.Request) {
	projectId, err := strconv.Atoi(r.PathValue("projectId"))
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	settings, err := app.taskTypeService.GetProjectSettings(projectId)
	if err != nil {
		respondErr(w, err)
		return
	}
	writeJSON(w, http.StatusOK, settings)
}

func (app *app) putProjectTaskTypes(w http.ResponseWriter, r *http.Request) {
	defer r.Body.Close()

	projectId, err := strconv.Atoi(r.PathValue("projectId"))
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	body := struct {
		EnabledTypeIDs []int `json:"enabledTypeIds"`
	}{}
	if err := json.NewDecoder(r.Body).Decode(&body); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	if err := app.taskTypeService.SetProjectTypes(projectId, body.EnabledTypeIDs); err != nil {
		respondErr(w, err)
		return
	}
	writeJSON(w, http.StatusOK, true)
}
