package main

import (
	"errors"
	"net/http"
	"strconv"
	"time"

	"github.com/waseem-polus/aycorn/server/internal/models/services"
)

// getUsage serves the /usage page summary. ?days=N sets how many days of daily
// activity to return (default 90).
func (app *app) getUsage(w http.ResponseWriter, r *http.Request) {
	days := 90
	if raw := r.URL.Query().Get("days"); raw != "" {
		parsed, err := strconv.Atoi(raw)
		if err != nil {
			http.Error(w, "days must be an integer", http.StatusBadRequest)
			return
		}
		days = parsed
	}

	usage, err := app.usageService.Get(time.Now(), days)
	if errors.Is(err, services.ErrInvalidUsageRange) {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}
	if err != nil {
		respondErr(w, err)
		return
	}
	writeJSON(w, http.StatusOK, usage)
}
