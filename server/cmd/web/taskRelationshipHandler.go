package main

import (
	"encoding/json"
	"errors"
	"net/http"
	"strconv"

	"github.com/waseem-polus/aycorn/server/internal/models/services"
)

func (app *app) getAllTaskRelationshipTypes(w http.ResponseWriter, r *http.Request) {
	types, err := app.taskRelationshipService.GetRelationshipTypes()
	if err != nil {
		respondErr(w, err)
		return
	}

	writeJSON(w, http.StatusOK, types)
}

type createRelationshipTypeBody struct {
	FromName string `json:"fromName"`
	ToName   string `json:"toName"`
	Behavior string `json:"behavior"`
	Icon     string `json:"icon"`
}

func (app *app) postTaskRelationshipType(w http.ResponseWriter, r *http.Request) {
	var body createRelationshipTypeBody
	if err := json.NewDecoder(r.Body).Decode(&body); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	id, err := app.taskRelationshipService.CreateRelationshipType(body.FromName, body.ToName, body.Behavior, body.Icon)
	if err != nil {
		respondErr(w, err)
		return
	}

	writeJSON(w, http.StatusCreated, map[string]int{"id": id})
}

type updateRelationshipTypeBody struct {
	FromName string `json:"fromName"`
	ToName   string `json:"toName"`
	Behavior string `json:"behavior"`
	Icon     string `json:"icon"`
}

func (app *app) putTaskRelationshipType(w http.ResponseWriter, r *http.Request) {
	id, err := strconv.Atoi(r.PathValue("id"))
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	var body updateRelationshipTypeBody
	if err := json.NewDecoder(r.Body).Decode(&body); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	if err := app.taskRelationshipService.UpdateRelationshipType(id, body.FromName, body.ToName, body.Behavior, body.Icon); err != nil {
		if errors.Is(err, services.ErrTypeNotFound) {
			http.Error(w, err.Error(), http.StatusNotFound)
			return
		}
		respondErr(w, err)
		return
	}

	w.WriteHeader(http.StatusNoContent)
}

type updateRelationshipTypeIconBody struct {
	Icon string `json:"icon"`
}

func (app *app) patchTaskRelationshipTypeIcon(w http.ResponseWriter, r *http.Request) {
	id, err := strconv.Atoi(r.PathValue("id"))
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	var body updateRelationshipTypeIconBody
	if err := json.NewDecoder(r.Body).Decode(&body); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	if err := app.taskRelationshipService.UpdateRelationshipTypeIcon(id, body.Icon); err != nil {
		if errors.Is(err, services.ErrTypeNotFound) {
			http.Error(w, err.Error(), http.StatusNotFound)
			return
		}
		respondErr(w, err)
		return
	}

	w.WriteHeader(http.StatusNoContent)
}

type updateRelationshipTypeNamesBody struct {
	FromName string `json:"fromName"`
	ToName   string `json:"toName"`
}

func (app *app) patchTaskRelationshipTypeNames(w http.ResponseWriter, r *http.Request) {
	id, err := strconv.Atoi(r.PathValue("id"))
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	var body updateRelationshipTypeNamesBody
	if err := json.NewDecoder(r.Body).Decode(&body); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	if err := app.taskRelationshipService.UpdateRelationshipTypeNames(id, body.FromName, body.ToName); err != nil {
		if errors.Is(err, services.ErrSystemType) {
			http.Error(w, err.Error(), http.StatusForbidden)
			return
		}
		respondErr(w, err)
		return
	}

	w.WriteHeader(http.StatusNoContent)
}

func (app *app) deleteTaskRelationshipType(w http.ResponseWriter, r *http.Request) {
	id, err := strconv.Atoi(r.PathValue("id"))
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	if err := app.taskRelationshipService.DeleteRelationshipType(id); err != nil {
		if errors.Is(err, services.ErrSystemType) {
			http.Error(w, err.Error(), http.StatusForbidden)
			return
		}
		respondErr(w, err)
		return
	}

	w.WriteHeader(http.StatusNoContent)
}

func (app *app) getTaskRelationships(w http.ResponseWriter, r *http.Request) {
	taskId, err := strconv.Atoi(r.PathValue("taskId"))
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	result, err := app.taskRelationshipService.GetTaskRelationships(taskId)
	if err != nil {
		respondErr(w, err)
		return
	}

	writeJSON(w, http.StatusOK, result)
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
