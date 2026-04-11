package main

import (
	"encoding/json"
	"log"
	"net/http"
	"strconv"

	"github.com/waseem-polus/aycorn/server/internal/models"
)

func (app *app) postChecklist(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Access-Control-Allow-Origin", "*")
	log.Println(r.RequestURI)

	projectId, err := strconv.Atoi(r.PathValue("projectId"))
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		log.Println(err.Error())
		return
	}

	newChecklist, err := app.checklistService.CreateChecklist(projectId)
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		log.Println(err.Error())
	}

	res, err := json.Marshal(newChecklist)
	if err != nil {
		http.Error(w, err.Error(), 500)
		log.Println(err.Error())
		return
	}

	w.Write(res)
}

func (app *app) putChecklist(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Access-Control-Allow-Origin", "*")
	log.Println(r.RequestURI)

	defer r.Body.Close()

	updatedChecklist := models.Checklist{}

	err := json.NewDecoder(r.Body).Decode(&updatedChecklist)
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		log.Println(err.Error())
		return
	}

	success, err := app.checklistService.UpdateChecklist(&updatedChecklist)
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		log.Println(err.Error())
	}

	res, err := json.Marshal(success)
	if err != nil {
		http.Error(w, err.Error(), 500)
		log.Println(err.Error())
		return
	}

	w.Write(res)
}

func (app *app) deleteChecklist(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Access-Control-Allow-Origin", "*")
	log.Println(r.RequestURI)

	checklistId, err := strconv.Atoi(r.PathValue("checklistId"))
	if err != nil {
		http.Error(w, err.Error(), 500)
		log.Println(err.Error())
		return
	}

	success, err := app.checklistService.DeleteChecklist(checklistId)
	if err != nil {
		http.Error(w, err.Error(), 500)
		log.Println(err.Error())
		return
	}

	res, err := json.Marshal(success)
	if err != nil {
		http.Error(w, err.Error(), 500)
		log.Println(err.Error())
		return
	}

	w.Write(res)
}
