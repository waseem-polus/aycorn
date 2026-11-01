package main

import (
	"encoding/json"
	"net/http"
	"strconv"

	"github.com/waseem-polus/aycorn/server/internal/models"
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
		Name       string              `json:"name"`
		Definition json.RawMessage     `json:"definition"`
		Pin        *models.FilterBoard `json:"pin"`
	}{}
	if err := json.NewDecoder(r.Body).Decode(&body); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}
	created, err := app.savedFilterService.Create(body.Name, body.Definition, body.Pin)
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

// putSavedFilterPins replaces the full set of boards a filter is pinned to.
func (app *app) putSavedFilterPins(w http.ResponseWriter, r *http.Request) {
	defer r.Body.Close()
	id, err := strconv.Atoi(r.PathValue("id"))
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}
	body := struct {
		Boards []models.FilterBoard `json:"boards"`
	}{}
	if err := json.NewDecoder(r.Body).Decode(&body); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}
	if err := app.savedFilterService.SetPins(id, body.Boards); err != nil {
		respondErr(w, err)
		return
	}
	writeJSON(w, http.StatusOK, true)
}

type filterPinBody struct {
	FilterID int                `json:"filterId"`
	Board    models.FilterBoard `json:"board"`
}

func (app *app) postFilterPin(w http.ResponseWriter, r *http.Request) {
	defer r.Body.Close()
	body := filterPinBody{}
	if err := json.NewDecoder(r.Body).Decode(&body); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}
	if err := app.savedFilterService.Pin(body.FilterID, body.Board); err != nil {
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
	if err := app.savedFilterService.Unpin(body.FilterID, body.Board); err != nil {
		respondErr(w, err)
		return
	}
	writeJSON(w, http.StatusOK, true)
}

func (app *app) putFilterPinOrder(w http.ResponseWriter, r *http.Request) {
	defer r.Body.Close()
	body := struct {
		Board     models.FilterBoard `json:"board"`
		FilterIDs []int              `json:"filterIds"`
	}{}
	if err := json.NewDecoder(r.Body).Decode(&body); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}
	result, err := app.savedFilterService.ReorderBoard(body.Board, body.FilterIDs)
	if err != nil {
		respondErr(w, err)
		return
	}
	writeJSON(w, http.StatusOK, result)
}
