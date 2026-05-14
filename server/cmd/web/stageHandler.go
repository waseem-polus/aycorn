package main

import (
	"encoding/json"
	"log"
	"net/http"
	"strconv"

	"github.com/waseem-polus/aycorn/server/internal/models"
)

func (app *app) putStage(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Access-Control-Allow-Origin", "*")
	log.Println(r.RequestURI)

	defer r.Body.Close()

	stageId, err := strconv.Atoi(r.PathValue("stageId"))
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		log.Println(err.Error())
		return
	}

	updatedStage := models.Stage{}
	if err := json.NewDecoder(r.Body).Decode(&updatedStage); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		log.Println(err.Error())
		return
	}
	updatedStage.ID = stageId

	success, err := app.stageService.UpdateStage(&updatedStage)
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
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

func (app *app) deleteStage(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Access-Control-Allow-Origin", "*")
	log.Println(r.RequestURI)

	stageId, err := strconv.Atoi(r.PathValue("stageId"))
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		log.Println(err.Error())
		return
	}

	success, err := app.stageService.DeleteStage(stageId)
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

func (app *app) putWorkflowStagesOrder(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Access-Control-Allow-Origin", "*")
	log.Println(r.RequestURI)

	defer r.Body.Close()

	workflowId, err := strconv.Atoi(r.PathValue("workflowId"))
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		log.Println(err.Error())
		return
	}

	orderedIds := []int{}
	if err := json.NewDecoder(r.Body).Decode(&orderedIds); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		log.Println(err.Error())
		return
	}

	if err := app.stageService.ReorderStages(workflowId, orderedIds); err != nil {
		http.Error(w, err.Error(), 500)
		log.Println(err.Error())
		return
	}

	res, err := json.Marshal(true)
	if err != nil {
		http.Error(w, err.Error(), 500)
		log.Println(err.Error())
		return
	}

	w.Write(res)
}
