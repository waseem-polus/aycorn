package main

import (
	"encoding/json"
	"log"
	"net/http"
	"strconv"

	"github.com/waseem-polus/aycorn/server/internal/models"
)

func (app *app) postTask(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Access-Control-Allow-Origin", "*")
	log.Println(r.RequestURI)

	defer r.Body.Close()

	task := models.ChecklistTask{}

	err := json.NewDecoder(r.Body).Decode(&task)
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		log.Println(err.Error())
		return
	}

	newTask, err := app.taskService.CreateChecklistTask(&task)
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		log.Println(err.Error())
	}

	res, err := json.Marshal(newTask)
	if err != nil {
		http.Error(w, err.Error(), 500)
		log.Println(err.Error())
		return
	}

	w.Write(res)
}

func (app *app) putTask(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Access-Control-Allow-Origin", "*")
	log.Println(r.RequestURI)

	defer r.Body.Close()

	updatedTask := models.ChecklistTask{}

	err := json.NewDecoder(r.Body).Decode(&updatedTask)
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		log.Println(err.Error())
		return
	}

	success, err := app.taskService.UpdateTask(&updatedTask)
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

func (app *app) deleteTask(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Access-Control-Allow-Origin", "*")
	log.Println(r.RequestURI)

	taskId, err := strconv.Atoi(r.PathValue("taskId"))
	if err != nil {
		http.Error(w, err.Error(), 500)
		log.Println(err.Error())
		return
	}

	success, err := app.taskService.DeleteTask(taskId)
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
