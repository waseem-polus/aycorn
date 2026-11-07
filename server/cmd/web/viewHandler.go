package main

import (
	"encoding/json"
	"net/http"
	"strconv"

	"github.com/waseem-polus/aycorn/server/internal/models"
	"github.com/waseem-polus/aycorn/server/internal/models/services"
)

// boardFromQuery reads `?surface=&projectId=`.
func boardFromQuery(r *http.Request) (models.FilterBoard, error) {
	q := r.URL.Query()
	board := models.FilterBoard{Surface: q.Get("surface")}
	projectID, err := optionalIntParam(q, "projectId")
	if err != nil {
		return board, err
	}
	board.ProjectID = projectID
	return board, nil
}

func (app *app) getViews(w http.ResponseWriter, r *http.Request) {
	board, err := boardFromQuery(r)
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}
	views, err := app.viewService.ForBoard(board)
	if err != nil {
		respondErr(w, err)
		return
	}
	writeJSON(w, http.StatusOK, views)
}

func (app *app) postView(w http.ResponseWriter, r *http.Request) {
	defer r.Body.Close()
	body := struct {
		Board models.FilterBoard `json:"board"`
		Type  string             `json:"type"`
	}{}
	if err := json.NewDecoder(r.Body).Decode(&body); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}
	created, err := app.viewService.Create(body.Board, body.Type)
	if err != nil {
		respondErr(w, err)
		return
	}
	writeJSON(w, http.StatusOK, created)
}

func (app *app) postDuplicateView(w http.ResponseWriter, r *http.Request) {
	id, err := strconv.Atoi(r.PathValue("id"))
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}
	created, err := app.viewService.Duplicate(id)
	if err != nil {
		respondErr(w, err)
		return
	}
	writeJSON(w, http.StatusOK, created)
}

// patchView updates only the fields present in the body. `groupBy: null`
// clears the grouping, which an absent key leaves alone — hence the raw map.
func (app *app) patchView(w http.ResponseWriter, r *http.Request) {
	defer r.Body.Close()
	id, err := strconv.Atoi(r.PathValue("id"))
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}
	raw := map[string]json.RawMessage{}
	if err := json.NewDecoder(r.Body).Decode(&raw); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}
	patch := services.ViewPatch{}
	for key, target := range map[string]**string{
		"name":  &patch.Name,
		"icon":  &patch.Icon,
		"color": &patch.Color,
		"type":  &patch.Type,
	} {
		if value, ok := raw[key]; ok {
			if err := json.Unmarshal(value, target); err != nil {
				http.Error(w, key+": "+err.Error(), http.StatusBadRequest)
				return
			}
		}
	}
	if value, ok := raw["groupBy"]; ok {
		patch.HasGroupBy = true
		if err := json.Unmarshal(value, &patch.GroupBy); err != nil {
			http.Error(w, "groupBy: "+err.Error(), http.StatusBadRequest)
			return
		}
	}
	if value, ok := raw["groupOptions"]; ok {
		patch.GroupOptions = &value
	}
	if value, ok := raw["source"]; ok {
		patch.Source = &value
	}

	updated, err := app.viewService.Update(id, patch)
	if err != nil {
		respondErr(w, err)
		return
	}
	writeJSON(w, http.StatusOK, updated)
}

func (app *app) deleteView(w http.ResponseWriter, r *http.Request) {
	id, err := strconv.Atoi(r.PathValue("id"))
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}
	if err := app.viewService.Delete(id); err != nil {
		respondErr(w, err)
		return
	}
	writeJSON(w, http.StatusOK, true)
}

func (app *app) putViewOrder(w http.ResponseWriter, r *http.Request) {
	defer r.Body.Close()
	body := struct {
		Board   models.FilterBoard `json:"board"`
		ViewIDs []int              `json:"viewIds"`
	}{}
	if err := json.NewDecoder(r.Body).Decode(&body); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}
	result, err := app.viewService.Reorder(body.Board, body.ViewIDs)
	if err != nil {
		respondErr(w, err)
		return
	}
	writeJSON(w, http.StatusOK, result)
}
