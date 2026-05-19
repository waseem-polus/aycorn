package main

import (
	"database/sql"
	"encoding/json"
	"errors"
	"log"
	"net/http"

	"github.com/waseem-polus/aycorn/server/internal/models/services"
)

// withCommon centralizes the cross-cutting handler preamble that was previously
// copy-pasted into every handler: permissive CORS for the localhost SPA and
// request logging. Applied once around the whole mux in routes().
func withCommon(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Access-Control-Allow-Origin", "*")
		log.Println(r.Method, r.RequestURI)
		next.ServeHTTP(w, r)
	})
}

// writeJSON marshals v and writes it with the given status. It is the single
// place that owns the "marshal failed -> 500" tail that was duplicated in
// every handler.
func writeJSON(w http.ResponseWriter, status int, v any) {
	res, err := json.Marshal(v)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		log.Println(err.Error())
		return
	}
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	w.Write(res)
}

// httpStatusForError maps a known service/sentinel error to the correct HTTP
// status. Anything unrecognized is a genuinely unexpected failure -> 500.
// This is the single source of truth for error->status mapping, replacing the
// per-handler errors.Is ladders.
func httpStatusForError(err error) int {
	switch {
	case errors.Is(err, sql.ErrNoRows):
		return http.StatusNotFound
	case errors.Is(err, services.ErrInvalidStageType),
		errors.Is(err, services.ErrInvalidStageColor),
		errors.Is(err, services.ErrCannotDeleteOpenStage),
		errors.Is(err, services.ErrInvalidMoveDestination),
		errors.Is(err, services.ErrInvalidStageOrder),
		errors.Is(err, services.ErrNoOpenStage),
		errors.Is(err, services.ErrInvalidStageMapping):
		return http.StatusBadRequest
	case errors.Is(err, services.ErrStageHasTasks):
		return http.StatusUnprocessableEntity
	case errors.Is(err, services.ErrWorkflowInUse):
		return http.StatusConflict
	default:
		return http.StatusInternalServerError
	}
}

// respondErr logs err and writes it with the status derived from
// httpStatusForError. Use this for every service-call failure so status
// mapping stays consistent and 500 is reserved for the unexpected.
func respondErr(w http.ResponseWriter, err error) {
	log.Println(err.Error())
	http.Error(w, err.Error(), httpStatusForError(err))
}
