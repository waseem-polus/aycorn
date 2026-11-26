package main

import (
	"encoding/json"
	"net/http"
	"strconv"
)

func (app *app) getAllSavedFilters(w http.ResponseWriter, r *http.Request) {
	filters, err := app.savedFilterService.GetAll()
	if err != nil {
		respondErr(w, err)
		return
	}
	writeJSON(w, http.StatusOK, filters)
}

func (app *app) postSavedFilter(w http.ResponseWriter, r *http.Request) {
	defer r.Body.Close()
	body := struct {
		Name       string          `json:"name"`
		Definition json.RawMessage `json:"definition"`
		// The view to pin the new filter to, if any.
		ViewID *int `json:"viewId"`
	}{}
	if err := json.NewDecoder(r.Body).Decode(&body); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}
	created, err := app.savedFilterService.Create(body.Name, body.Definition, body.ViewID)
	if err != nil {
		respondErr(w, err)
		return
	}
	writeJSON(w, http.StatusOK, created)
}

// patchSavedFilter updates only the fields present in the body.
func (app *app) patchSavedFilter(w http.ResponseWriter, r *http.Request) {
	defer r.Body.Close()
	id, err := strconv.Atoi(r.PathValue("id"))
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}
	body := struct {
		Name       *string          `json:"name"`
		Definition *json.RawMessage `json:"definition"`
	}{}
	if err := json.NewDecoder(r.Body).Decode(&body); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}
	if err := app.savedFilterService.Update(id, body.Name, body.Definition); err != nil {
		respondErr(w, err)
		return
	}
	writeJSON(w, http.StatusOK, true)
}

func (app *app) postDuplicateSavedFilter(w http.ResponseWriter, r *http.Request) {
	id, err := strconv.Atoi(r.PathValue("id"))
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}
	created, err := app.savedFilterService.Duplicate(id)
	if err != nil {
		respondErr(w, err)
		return
	}
	writeJSON(w, http.StatusOK, created)
}

func (app *app) deleteSavedFilter(w http.ResponseWriter, r *http.Request) {
	id, err := strconv.Atoi(r.PathValue("id"))
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}
	result, err := app.savedFilterService.BulkDelete([]int{id})
	if err != nil {
		respondErr(w, err)
		return
	}
	writeJSON(w, http.StatusOK, result)
}

func (app *app) bulkDeleteSavedFilters(w http.ResponseWriter, r *http.Request) {
	defer r.Body.Close()
	body := struct {
		IDs []int `json:"ids"`
	}{}
	if err := json.NewDecoder(r.Body).Decode(&body); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}
	result, err := app.savedFilterService.BulkDelete(body.IDs)
	if err != nil {
		respondErr(w, err)
		return
	}
	writeJSON(w, http.StatusOK, result)
}

type filterPinBody struct {
	FilterID int `json:"filterId"`
	ViewID   int `json:"viewId"`
}

func (app *app) postFilterPin(w http.ResponseWriter, r *http.Request) {
	defer r.Body.Close()
	body := filterPinBody{}
	if err := json.NewDecoder(r.Body).Decode(&body); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}
	if err := app.savedFilterService.Pin(body.FilterID, body.ViewID); err != nil {
		respondErr(w, err)
		return
	}
	writeJSON(w, http.StatusOK, true)
}

func (app *app) deleteFilterPin(w http.ResponseWriter, r *http.Request) {
	defer r.Body.Close()
	body := filterPinBody{}
	if err := json.NewDecoder(r.Body).Decode(&body); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}
	if err := app.savedFilterService.Unpin(body.FilterID, body.ViewID); err != nil {
		respondErr(w, err)
		return
	}
	writeJSON(w, http.StatusOK, true)
}

// putViewFilters replaces a view's pinned saved filters, in order.
func (app *app) putViewFilters(w http.ResponseWriter, r *http.Request) {
	defer r.Body.Close()
	id, err := strconv.Atoi(r.PathValue("id"))
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}
	body := struct {
		FilterIDs []int `json:"filterIds"`
	}{}
	if err := json.NewDecoder(r.Body).Decode(&body); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}
	result, err := app.savedFilterService.SetViewFilters(id, body.FilterIDs)
	if err != nil {
		respondErr(w, err)
		return
	}
	writeJSON(w, http.StatusOK, result)
}
