package main

import (
	"encoding/json"
	"net/http"
	"strconv"

	"github.com/waseem-polus/aycorn/server/internal/models"
)

func (app *app) getAllWorkflows(w http.ResponseWriter, r *http.Request) {
	workflows, err := app.workflowService.GetAllWorkflows()
	if err != nil {
		respondErr(w, err)
		return
	}

	writeJSON(w, http.StatusOK, workflows)
}

func (app *app) getWorkflow(w http.ResponseWriter, r *http.Request) {
	workflowId, err := strconv.Atoi(r.PathValue("workflowId"))
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	details, err := app.workflowService.GetWorkflowDetails(workflowId)
	if err != nil {
		respondErr(w, err)
		return
	}

	writeJSON(w, http.StatusOK, details)
}

func (app *app) postWorkflow(w http.ResponseWriter, r *http.Request) {
	id, err := app.workflowService.CreateWorkflow()
	if err != nil {
		respondErr(w, err)
		return
	}

	writeJSON(w, http.StatusOK, id)
}

func (app *app) putWorkflow(w http.ResponseWriter, r *http.Request) {
	defer r.Body.Close()

	workflowId, err := strconv.Atoi(r.PathValue("workflowId"))
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	updatedWorkflow := models.Workflow{}
	if err := json.NewDecoder(r.Body).Decode(&updatedWorkflow); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}
	updatedWorkflow.ID = workflowId

	success, err := app.workflowService.UpdateWorkflow(&updatedWorkflow)
	if err != nil {
		respondErr(w, err)
		return
	}

	writeJSON(w, http.StatusOK, success)
}

func (app *app) bulkDeleteWorkflows(w http.ResponseWriter, r *http.Request) {
	defer r.Body.Close()

	ids := []int{}
	if err := json.NewDecoder(r.Body).Decode(&ids); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	result, err := app.workflowService.BulkDeleteWorkflows(ids)
	if err != nil {
		respondErr(w, err)
		return
	}

	writeJSON(w, http.StatusOK, result)
}

func (app *app) bulkDuplicateWorkflows(w http.ResponseWriter, r *http.Request) {
	defer r.Body.Close()

	ids := []int{}
	if err := json.NewDecoder(r.Body).Decode(&ids); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	result, err := app.workflowService.BulkDuplicateWorkflows(ids)
	if err != nil {
		respondErr(w, err)
		return
	}

	writeJSON(w, http.StatusOK, result)
}

func (app *app) deleteWorkflow(w http.ResponseWriter, r *http.Request) {
	workflowId, err := strconv.Atoi(r.PathValue("workflowId"))
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	success, err := app.workflowService.DeleteWorkflow(workflowId)
	if err != nil {
		respondErr(w, err)
		return
	}

	writeJSON(w, http.StatusOK, success)
}
