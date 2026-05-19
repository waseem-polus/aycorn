package main

import (
	"encoding/json"
	"errors"
	"io"
	"net/http"
	"strconv"

	"github.com/waseem-polus/aycorn/server/internal/models"
)

func (app *app) postStage(w http.ResponseWriter, r *http.Request) {
	defer r.Body.Close()

	workflowId, err := strconv.Atoi(r.PathValue("workflowId"))
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	body := struct {
		Type string `json:"type"`
	}{}
	if err := json.NewDecoder(r.Body).Decode(&body); err != nil && !errors.Is(err, io.EOF) {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	stage, err := app.stageService.CreateStage(workflowId, body.Type)
	if err != nil {
		respondErr(w, err)
		return
	}

	writeJSON(w, http.StatusOK, stage)
}

func (app *app) putStage(w http.ResponseWriter, r *http.Request) {
	defer r.Body.Close()

	stageId, err := strconv.Atoi(r.PathValue("stageId"))
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	updatedStage := models.Stage{}
	if err := json.NewDecoder(r.Body).Decode(&updatedStage); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}
	updatedStage.ID = stageId

	success, err := app.stageService.UpdateStage(&updatedStage)
	if err != nil {
		respondErr(w, err)
		return
	}

	writeJSON(w, http.StatusOK, success)
}

func (app *app) deleteStage(w http.ResponseWriter, r *http.Request) {
	defer r.Body.Close()

	stageId, err := strconv.Atoi(r.PathValue("stageId"))
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	body := struct {
		MoveTasksTo *int `json:"moveTasksTo"`
	}{}
	if err := json.NewDecoder(r.Body).Decode(&body); err != nil && !errors.Is(err, io.EOF) {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	success, err := app.stageService.DeleteStage(stageId, body.MoveTasksTo)
	if err != nil {
		respondErr(w, err)
		return
	}

	writeJSON(w, http.StatusOK, success)
}

func (app *app) bulkSetStageType(w http.ResponseWriter, r *http.Request) {
	defer r.Body.Close()

	body := struct {
		IDs  []int  `json:"ids"`
		Type string `json:"type"`
	}{}
	if err := json.NewDecoder(r.Body).Decode(&body); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	result, err := app.stageService.BulkSetType(body.IDs, body.Type)
	if err != nil {
		respondErr(w, err)
		return
	}

	writeJSON(w, http.StatusOK, result)
}

func (app *app) bulkSetStageColor(w http.ResponseWriter, r *http.Request) {
	defer r.Body.Close()

	body := struct {
		IDs   []int  `json:"ids"`
		Color string `json:"color"`
	}{}
	if err := json.NewDecoder(r.Body).Decode(&body); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	result, err := app.stageService.BulkSetColor(body.IDs, body.Color)
	if err != nil {
		respondErr(w, err)
		return
	}

	writeJSON(w, http.StatusOK, result)
}

func (app *app) bulkSetStageIcon(w http.ResponseWriter, r *http.Request) {
	defer r.Body.Close()

	body := struct {
		IDs  []int  `json:"ids"`
		Icon string `json:"icon"`
	}{}
	if err := json.NewDecoder(r.Body).Decode(&body); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	result, err := app.stageService.BulkSetIcon(body.IDs, body.Icon)
	if err != nil {
		respondErr(w, err)
		return
	}

	writeJSON(w, http.StatusOK, result)
}

func (app *app) bulkDeleteStages(w http.ResponseWriter, r *http.Request) {
	defer r.Body.Close()

	body := struct {
		IDs          []int          `json:"ids"`
		TaskMappings map[string]int `json:"taskMappings"`
	}{}
	if err := json.NewDecoder(r.Body).Decode(&body); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	// Convert string-keyed taskMappings (JSON keys must be strings) to int keys.
	taskMappings := map[int]int{}
	for k, v := range body.TaskMappings {
		id, err := strconv.Atoi(k)
		if err != nil {
			http.Error(w, "invalid taskMappings key: "+k, http.StatusBadRequest)
			return
		}
		taskMappings[id] = v
	}

	result, err := app.stageService.BulkDelete(body.IDs, taskMappings)
	if err != nil {
		respondErr(w, err)
		return
	}

	writeJSON(w, http.StatusOK, result)
}

func (app *app) bulkMoveStages(w http.ResponseWriter, r *http.Request) {
	defer r.Body.Close()

	workflowId, err := strconv.Atoi(r.PathValue("workflowId"))
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	body := struct {
		IDs      []int `json:"ids"`
		BeforeID *int  `json:"beforeId"`
	}{}
	if err := json.NewDecoder(r.Body).Decode(&body); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	result, err := app.stageService.BulkMoveStages(workflowId, body.IDs, body.BeforeID)
	if err != nil {
		respondErr(w, err)
		return
	}

	writeJSON(w, http.StatusOK, result)
}

func (app *app) putWorkflowStagesOrder(w http.ResponseWriter, r *http.Request) {
	defer r.Body.Close()

	workflowId, err := strconv.Atoi(r.PathValue("workflowId"))
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	orderedIds := []int{}
	if err := json.NewDecoder(r.Body).Decode(&orderedIds); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	if err := app.stageService.ReorderStages(workflowId, orderedIds); err != nil {
		respondErr(w, err)
		return
	}

	writeJSON(w, http.StatusOK, true)
}
