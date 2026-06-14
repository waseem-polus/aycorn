package main

import (
	"encoding/json"
	"net/http"
	"strconv"
)

func (app *app) getAllTaskRelationshipTypes(w http.ResponseWriter, r *http.Request) {
	types, err := app.taskRelationshipService.GetRelationshipTypes()
	if err != nil {
		respondErr(w, err)
		return
	}

	writeJSON(w, http.StatusOK, types)
}

func (app *app) getTaskRelationships(w http.ResponseWriter, r *http.Request) {
	taskId, err := strconv.Atoi(r.PathValue("taskId"))
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	relationships, err := app.taskRelationshipService.GetTaskRelationships(taskId)
	if err != nil {
		respondErr(w, err)
		return
	}

	writeJSON(w, http.StatusOK, relationships)
}

type createRelationshipBody struct {
	FromTaskID int `json:"fromTaskId"`
	ToTaskID   int `json:"toTaskId"`
	TypeID     int `json:"typeId"`
}

func (app *app) deleteTaskRelationship(w http.ResponseWriter, r *http.Request) {
	id, err := strconv.Atoi(r.PathValue("id"))
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	if err := app.taskRelationshipService.DeleteRelationship(id); err != nil {
		respondErr(w, err)
		return
	}

	w.WriteHeader(http.StatusNoContent)
}

func (app *app) createTaskRelationship(w http.ResponseWriter, r *http.Request) {
	var body createRelationshipBody
	if err := json.NewDecoder(r.Body).Decode(&body); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	if err := app.taskRelationshipService.CreateRelationship(body.FromTaskID, body.ToTaskID, body.TypeID); err != nil {
		respondErr(w, err)
		return
	}

	w.WriteHeader(http.StatusCreated)
}
