package main

import (
	"encoding/json"
	"net/http"

	"github.com/waseem-polus/aycorn/server/internal/models"
)

func (app *app) getAppSettings(w http.ResponseWriter, r *http.Request) {
	settings, err := app.appSettingsService.Get()
	if err != nil {
		respondErr(w, err)
		return
	}
	writeJSON(w, http.StatusOK, settings)
}

func (app *app) putAppSettings(w http.ResponseWriter, r *http.Request) {
	defer r.Body.Close()

	body := models.AppSettings{}
	if err := json.NewDecoder(r.Body).Decode(&body); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	updated, err := app.appSettingsService.Update(&body)
	if err != nil {
		respondErr(w, err)
		return
	}
	writeJSON(w, http.StatusOK, updated)
}
