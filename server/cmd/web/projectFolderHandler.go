package main

import (
	"encoding/json"
	"errors"
	"net/http"
	"strconv"

	"github.com/waseem-polus/aycorn/server/internal/models/services"
)

func (app *app) getAllProjectFolders(w http.ResponseWriter, r *http.Request) {
	folders, err := app.projectFolderService.GetAll()
	if err != nil {
		respondErr(w, err)
		return
	}
	writeJSON(w, http.StatusOK, folders)
}

func (app *app) postProjectFolder(w http.ResponseWriter, r *http.Request) {
	created, err := app.projectFolderService.Create()
	if err != nil {
		respondErr(w, err)
		return
	}
	writeJSON(w, http.StatusOK, created)
}

func (app *app) putProjectFolder(w http.ResponseWriter, r *http.Request) {
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

	ok, err := app.projectFolderService.Update(id, body.Name)
	if err != nil {
		respondErr(w, err)
		return
	}
	writeJSON(w, http.StatusOK, ok)
}

func (app *app) deleteProjectFolder(w http.ResponseWriter, r *http.Request) {
	defer r.Body.Close()

	id, err := strconv.Atoi(r.PathValue("id"))
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	body := struct {
		TransferFolderID int `json:"transferFolderId"`
	}{}
	if err := json.NewDecoder(r.Body).Decode(&body); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	if err := app.projectFolderService.Delete(id, body.TransferFolderID); err != nil {
		if errors.Is(err, services.ErrDefaultProjectFolder) {
			http.Error(w, err.Error(), http.StatusBadRequest)
			return
		}
		respondErr(w, err)
		return
	}
	writeJSON(w, http.StatusOK, true)
}

func (app *app) putProjectFolderReorder(w http.ResponseWriter, r *http.Request) {
	defer r.Body.Close()

	body := struct {
		IDs []int `json:"ids"`
	}{}
	if err := json.NewDecoder(r.Body).Decode(&body); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	if err := app.projectFolderService.Reorder(body.IDs); err != nil {
		respondErr(w, err)
		return
	}
	writeJSON(w, http.StatusOK, true)
}
