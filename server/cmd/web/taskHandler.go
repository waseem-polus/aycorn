package main

import (
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"net/url"
	"strconv"

	"github.com/waseem-polus/aycorn/server/internal/models"
	"github.com/waseem-polus/aycorn/server/internal/models/repos"
	"github.com/waseem-polus/aycorn/server/internal/timefmt"
)

// normalizedDateParam reads an optional RFC3339 date bound and converts it to
// the canonical storage encoding, so the repo can compare it directly against
// stored values. An empty param means "no bound"; a malformed one is a client
// error, not a silently empty result set.
func normalizedDateParam(q url.Values, key string) (string, error) {
	raw := q.Get(key)
	if raw == "" {
		return "", nil
	}
	normalized, err := timefmt.Normalize(raw)
	if err != nil {
		return "", fmt.Errorf("invalid %s: %w", key, err)
	}
	return normalized, nil
}

// presenceParam reads an optional date-presence filter. Empty means "no
// constraint"; anything outside the known set is a client error rather than a
// silently ignored param.
func presenceParam(q url.Values, key string) (string, error) {
	raw := q.Get(key)
	if raw == "" || raw == "none" || raw == "any" {
		return raw, nil
	}
	return "", fmt.Errorf("invalid %s: %q", key, raw)
}

// parseTaskFilters reads the task filter query params shared by every task
// listing — the project-scoped one included — so a filter is parsed in exactly
// one place. A malformed date or presence value is a client error.
func parseTaskFilters(q url.Values) (*repos.TaskFilters, error) {
	dates := map[string]string{}
	for _, key := range []string{"plannedFrom", "plannedTo", "completedFrom", "completedTo"} {
		normalized, err := normalizedDateParam(q, key)
		if err != nil {
			return nil, err
		}
		dates[key] = normalized
	}

	presence := map[string]string{}
	for _, key := range []string{"plannedPresence", "completedPresence"} {
		value, err := presenceParam(q, key)
		if err != nil {
			return nil, err
		}
		presence[key] = value
	}

	return &repos.TaskFilters{
		SearchQuery:    q.Get("search"),
		ChecklistQuery: getQuerySlice(q, "checklist"),
		TypeIDQuery:    getQuerySliceInt(q, "typeId"),
		StageQuery:     getQuerySlice(q, "stage"),
		PriorityQuery:  getQuerySlice(q, "priority"),
		AssigneeQuery:  getQuerySlice(q, "assignee"),
		ProjectIDQuery: getQuerySliceInt(q, "project"),
		PlannedFrom:    dates["plannedFrom"],
		PlannedTo:      dates["plannedTo"],
		CompletedFrom:  dates["completedFrom"],
		CompletedTo:    dates["completedTo"],

		PlannedPresence:   presence["plannedPresence"],
		CompletedPresence: presence["completedPresence"],
	}, nil
}

// optionalIntParam reads an optional integer query param. Absent means nil; a
// non-numeric value is a client error rather than a silently ignored filter.
func optionalIntParam(q url.Values, key string) (*int, error) {
	raw := q.Get(key)
	if raw == "" {
		return nil, nil
	}
	value, err := strconv.Atoi(raw)
	if err != nil {
		return nil, fmt.Errorf("invalid %s: %q", key, raw)
	}
	return &value, nil
}

func (app *app) getUpcomingTasks(w http.ResponseWriter, r *http.Request) {
	taskFilters, err := parseTaskFilters(r.URL.Query())
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	tasks, err := app.taskService.GetAllTasks(taskFilters)
	if err != nil {
		respondErr(w, err)
		return
	}

	writeJSON(w, http.StatusOK, tasks)
}

func (app *app) getTaskFacets(w http.ResponseWriter, r *http.Request) {
	projectID, err := optionalIntParam(r.URL.Query(), "project")
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	facets, err := app.taskService.GetTaskFacets(projectID)
	if err != nil {
		respondErr(w, err)
		return
	}

	writeJSON(w, http.StatusOK, facets)
}

func (app *app) getTask(w http.ResponseWriter, r *http.Request) {
	taskId, err := strconv.Atoi(r.PathValue("taskId"))
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	task, err := app.taskService.GetTask(taskId)
	if err != nil {
		respondErr(w, err)
		return
	}

	writeJSON(w, http.StatusOK, task)
}

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

func (app *app) putTaskBody(w http.ResponseWriter, r *http.Request) {
	defer r.Body.Close()

	taskId, err := strconv.Atoi(r.PathValue("taskId"))
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	// The request body is the serialized Plate document (a JSON array) to store
	// verbatim in the body column.
	body, err := io.ReadAll(r.Body)
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	success, err := app.taskService.UpdateTaskBody(taskId, string(body))
	if err != nil {
		respondErr(w, err)
		return
	}

	writeJSON(w, http.StatusOK, success)
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
