package main

import (
	"encoding/json"
	"io"
	"net/http"
	"strconv"

	"github.com/waseem-polus/aycorn/server/internal/models"
)

func (app *app) postChecklist(w http.ResponseWriter, r *http.Request) {
	defer r.Body.Close()

	projectId, err := strconv.Atoi(r.PathValue("projectId"))
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	var body struct{ Name string }
	if err := json.NewDecoder(r.Body).Decode(&body); err != nil && err != io.EOF {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	newChecklist, err := app.checklistService.CreateChecklist(projectId, body.Name)
	if err != nil {
		respondErr(w, err)
		return
	}

	writeJSON(w, http.StatusOK, newChecklist)
}

func (app *app) putChecklist(w http.ResponseWriter, r *http.Request) {
	defer r.Body.Close()

	updatedChecklist := models.Checklist{}
	if err := json.NewDecoder(r.Body).Decode(&updatedChecklist); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	success, err := app.checklistService.UpdateChecklist(&updatedChecklist)
	if err != nil {
		respondErr(w, err)
		return
	}

	writeJSON(w, http.StatusOK, success)
}

func (app *app) deleteChecklist(w http.ResponseWriter, r *http.Request) {
	defer r.Body.Close()

	checklistId, err := strconv.Atoi(r.PathValue("checklistId"))
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	body := struct {
		TransferChecklistID int `json:"transferChecklistId"`
	}{}
	if err := json.NewDecoder(r.Body).Decode(&body); err != nil && err != io.EOF {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	success, err := app.checklistService.DeleteChecklist(checklistId, body.TransferChecklistID)
	if err != nil {
		respondErr(w, err)
		return
	}

	writeJSON(w, http.StatusOK, success)
}
