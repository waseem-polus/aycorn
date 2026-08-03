package main

import (
	"encoding/json"
	"net/http"
	"strconv"

	"github.com/waseem-polus/aycorn/server/internal/models"
	"github.com/waseem-polus/aycorn/server/internal/models/repos"
)

func (app *app) getAllProjects(w http.ResponseWriter, r *http.Request) {
	// No `archived` param means "both" — only the projects page splits the two.
	var archived *bool
	if raw := r.URL.Query().Get("archived"); raw != "" {
		value := raw == "true"
		archived = &value
	}

	projects, err := app.projectService.GetAllProjects(archived)
	if err != nil {
		respondErr(w, err)
		return
	}

	writeJSON(w, http.StatusOK, projects)
}

func (app *app) getPinnedProjects(w http.ResponseWriter, r *http.Request) {
	projects, err := app.projectService.GetPinnedProjects()
	if err != nil {
		respondErr(w, err)
		return
	}

	writeJSON(w, http.StatusOK, projects)
}

func (app *app) getProjectChecklists(w http.ResponseWriter, r *http.Request) {
	projectId, err := strconv.Atoi(r.PathValue("projectId"))
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	checklists, err := app.checklistService.GetChecklistsInProject(projectId)
	if err != nil {
		respondErr(w, err)
		return
	}

	writeJSON(w, http.StatusOK, checklists)
}

func (app *app) getProject(w http.ResponseWriter, r *http.Request) {
	projectId, err := strconv.Atoi(r.PathValue("projectId"))
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	q := r.URL.Query()

	taskFilters := &repos.TaskFilters{
		SearchQuery:    q.Get("search"),
		ChecklistQuery: getQuerySlice(q, "checklist"),
		TypeIDQuery:    getQuerySliceInt(q, "typeId"),
		StageQuery:     getQuerySlice(q, "stage"),
		PriorityQuery:  getQuerySlice(q, "priority"),
		AssigneeQuery:  getQuerySlice(q, "assignee"),
	}

	projectDetails, err := app.projectService.GetProjectDetails(projectId, taskFilters)
	if err != nil {
		respondErr(w, err)
		return
	}

	writeJSON(w, http.StatusOK, projectDetails)
}

func (app *app) getProjectWorkflowSettings(w http.ResponseWriter, r *http.Request) {
	projectId, err := strconv.Atoi(r.PathValue("projectId"))
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	settings, err := app.projectService.GetProjectWorkflowSettings(projectId)
	if err != nil {
		respondErr(w, err)
		return
	}

	writeJSON(w, http.StatusOK, settings)
}

func (app *app) switchProjectWorkflow(w http.ResponseWriter, r *http.Request) {
	defer r.Body.Close()

	projectId, err := strconv.Atoi(r.PathValue("projectId"))
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	body := struct {
		WorkflowID    int            `json:"workflowId"`
		StageMappings map[string]int `json:"stageMappings"`
	}{}
	if err := json.NewDecoder(r.Body).Decode(&body); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	// Convert string-keyed stageMappings (JSON keys must be strings) to int keys.
	mappings := map[int]int{}
	for k, v := range body.StageMappings {
		id, err := strconv.Atoi(k)
		if err != nil {
			http.Error(w, "invalid stageMappings key: "+k, http.StatusBadRequest)
			return
		}
		mappings[id] = v
	}

	result, err := app.projectService.SwitchProjectWorkflow(projectId, body.WorkflowID, mappings)
	if err != nil {
		respondErr(w, err)
		return
	}

	writeJSON(w, http.StatusOK, result)
}

func (app *app) putProject(w http.ResponseWriter, r *http.Request) {
	defer r.Body.Close()

	updatedProject := models.Project{}
	if err := json.NewDecoder(r.Body).Decode(&updatedProject); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	success, err := app.projectService.UpdateProject(&updatedProject)
	if err != nil {
		respondErr(w, err)
		return
	}

	writeJSON(w, http.StatusOK, success)
}

func (app *app) postProject(w http.ResponseWriter, r *http.Request) {
	defer r.Body.Close()

	var body struct {
		WorkflowID int `json:"workflowId"`
	}
	if err := json.NewDecoder(r.Body).Decode(&body); err != nil || body.WorkflowID == 0 {
		http.Error(w, "workflowId required", http.StatusBadRequest)
		return
	}

	id, err := app.projectService.CreateProject(body.WorkflowID)
	if err != nil {
		respondErr(w, err)
		return
	}

	writeJSON(w, http.StatusOK, id)
}

func (app *app) bulkSetProjectsPinned(w http.ResponseWriter, r *http.Request) {
	defer r.Body.Close()

	body := struct {
		IDs    []int `json:"ids"`
		Pinned bool  `json:"pinned"`
	}{}
	if err := json.NewDecoder(r.Body).Decode(&body); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	result, err := app.projectService.BulkSetPinned(body.IDs, body.Pinned)
	if err != nil {
		respondErr(w, err)
		return
	}

	writeJSON(w, http.StatusOK, result)
}

func (app *app) bulkSetProjectsArchived(w http.ResponseWriter, r *http.Request) {
	defer r.Body.Close()

	body := struct {
		IDs      []int `json:"ids"`
		Archived bool  `json:"archived"`
	}{}
	if err := json.NewDecoder(r.Body).Decode(&body); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	result, err := app.projectService.BulkSetArchived(body.IDs, body.Archived)
	if err != nil {
		respondErr(w, err)
		return
	}

	writeJSON(w, http.StatusOK, result)
}

func (app *app) bulkSetProjectsFolder(w http.ResponseWriter, r *http.Request) {
	defer r.Body.Close()

	body := struct {
		IDs    []int `json:"ids"`
		Folder int   `json:"folder"`
	}{}
	if err := json.NewDecoder(r.Body).Decode(&body); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	result, err := app.projectService.BulkSetFolder(body.IDs, body.Folder)
	if err != nil {
		respondErr(w, err)
		return
	}

	writeJSON(w, http.StatusOK, result)
}

func (app *app) putPinnedProjectsOrder(w http.ResponseWriter, r *http.Request) {
	defer r.Body.Close()

	body := struct {
		IDs []int `json:"ids"`
	}{}
	if err := json.NewDecoder(r.Body).Decode(&body); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	result, err := app.projectService.ReorderPinnedProjects(body.IDs)
	if err != nil {
		respondErr(w, err)
		return
	}

	writeJSON(w, http.StatusOK, result)
}

func (app *app) postDuplicateProjectConfig(w http.ResponseWriter, r *http.Request) {
	projectId, err := strconv.Atoi(r.PathValue("projectId"))
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	id, err := app.projectService.DuplicateProjectConfig(projectId)
	if err != nil {
		respondErr(w, err)
		return
	}

	writeJSON(w, http.StatusOK, struct {
		ID int `json:"id"`
	}{ID: id})
}

func (app *app) bulkDeleteProjects(w http.ResponseWriter, r *http.Request) {
	defer r.Body.Close()

	ids := []int{}
	if err := json.NewDecoder(r.Body).Decode(&ids); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	result, err := app.projectService.BulkDeleteProjects(ids)
	if err != nil {
		respondErr(w, err)
		return
	}

	writeJSON(w, http.StatusOK, result)
}

func (app *app) deleteProject(w http.ResponseWriter, r *http.Request) {
	projectId, err := strconv.Atoi(r.PathValue("projectId"))
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	success, err := app.projectService.DeleteProject(projectId)
	if err != nil {
		respondErr(w, err)
		return
	}

	writeJSON(w, http.StatusOK, success)
}
