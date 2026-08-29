package main

import (
	"encoding/json"
	"errors"
	"net/http"
	"strconv"

	"github.com/waseem-polus/aycorn/server/internal/models/services"
)

func (app *app) getAllTaskTypeCategories(w http.ResponseWriter, r *http.Request) {
	categories, err := app.taskTypeCategoryService.GetAll()
	if err != nil {
		respondErr(w, err)
		return
	}
	writeJSON(w, http.StatusOK, categories)
}

func (app *app) postTaskTypeCategory(w http.ResponseWriter, r *http.Request) {
	created, err := app.taskTypeCategoryService.Create()
	if err != nil {
		respondErr(w, err)
		return
	}
	writeJSON(w, http.StatusOK, created)
}

func (app *app) putTaskTypeCategory(w http.ResponseWriter, r *http.Request) {
	defer r.Body.Close()

	id, err := strconv.Atoi(r.PathValue("id"))
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	body := struct {
		Name string `json:"name"`
	}{}
	if err := json.NewDecoder(r.Body).Decode(&body); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	ok, err := app.taskTypeCategoryService.Update(id, body.Name)
	if err != nil {
		respondErr(w, err)
		return
	}
	writeJSON(w, http.StatusOK, ok)
}

func (app *app) deleteTaskTypeCategory(w http.ResponseWriter, r *http.Request) {
	defer r.Body.Close()

	id, err := strconv.Atoi(r.PathValue("id"))
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	body := struct {
		TransferCategoryID int `json:"transferCategoryId"`
	}{}
	if err := json.NewDecoder(r.Body).Decode(&body); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	if err := app.taskTypeCategoryService.Delete(id, body.TransferCategoryID); err != nil {
		if errors.Is(err, services.ErrDefaultTaskTypeCategory) {
			http.Error(w, err.Error(), http.StatusBadRequest)
			return
		}
		respondErr(w, err)
		return
	}
	writeJSON(w, http.StatusOK, true)
}

func (app *app) putTaskTypeCategoryReorder(w http.ResponseWriter, r *http.Request) {
	defer r.Body.Close()

	body := struct {
		IDs []int `json:"ids"`
	}{}
	if err := json.NewDecoder(r.Body).Decode(&body); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	if err := app.taskTypeCategoryService.Reorder(body.IDs); err != nil {
		respondErr(w, err)
		return
	}
	writeJSON(w, http.StatusOK, true)
}
