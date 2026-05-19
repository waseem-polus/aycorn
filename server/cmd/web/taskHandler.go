package main

import (
	"encoding/json"
	"net/http"
	"strconv"

	"github.com/waseem-polus/aycorn/server/internal/models"
)

func (app *app) getTaskBody(w http.ResponseWriter, r *http.Request) {
	taskId, err := strconv.Atoi(r.PathValue("taskId"))
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	taskBody, err := app.taskService.GetTaskBody(taskId)
	if err != nil {
		respondErr(w, err)
		return
	}

	writeJSON(w, http.StatusOK, taskBody)
}

func (app *app) postTask(w http.ResponseWriter, r *http.Request) {
	defer r.Body.Close()

	task := models.ChecklistTask{}
	if err := json.NewDecoder(r.Body).Decode(&task); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	newTask, err := app.taskService.CreateChecklistTask(&task)
	if err != nil {
		respondErr(w, err)
		return
	}

	writeJSON(w, http.StatusOK, newTask)
}

func (app *app) putTask(w http.ResponseWriter, r *http.Request) {
	defer r.Body.Close()

	updatedTask := models.ChecklistTask{}
	if err := json.NewDecoder(r.Body).Decode(&updatedTask); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	success, err := app.taskService.UpdateTask(&updatedTask)
	if err != nil {
		respondErr(w, err)
		return
	}

	writeJSON(w, http.StatusOK, success)
}

func (app *app) bulkUpdateTasks(w http.ResponseWriter, r *http.Request) {
	defer r.Body.Close()

	body := struct {
		IDs     []int          `json:"ids"`
		Changes map[string]any `json:"changes"`
	}{}
	if err := json.NewDecoder(r.Body).Decode(&body); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	result, err := app.taskService.BulkUpdate(body.IDs, body.Changes)
	if err != nil {
		respondErr(w, err)
		return
	}

	writeJSON(w, http.StatusOK, result)
}

func (app *app) bulkDeleteTasks(w http.ResponseWriter, r *http.Request) {
	defer r.Body.Close()

	ids := []int{}
	if err := json.NewDecoder(r.Body).Decode(&ids); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	result, err := app.taskService.BulkDelete(ids)
	if err != nil {
		respondErr(w, err)
		return
	}

	writeJSON(w, http.StatusOK, result)
}

func (app *app) deleteTask(w http.ResponseWriter, r *http.Request) {
	taskId, err := strconv.Atoi(r.PathValue("taskId"))
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	success, err := app.taskService.DeleteTask(taskId)
	if err != nil {
		respondErr(w, err)
		return
	}

	writeJSON(w, http.StatusOK, success)
}
