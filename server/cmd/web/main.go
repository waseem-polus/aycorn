package main

import (
	"database/sql"
	"log"
	"net/http"

	_ "github.com/mattn/go-sqlite3"
	"github.com/waseem-polus/aycorn/server/internal/models/repos"
)

type app struct {
	projects *repos.ProjectModel
}

func main() {
	db, err := sql.Open("sqlite3", "./app.db")
	if err != nil {
		log.Fatal(err)
	}

	app := app{
		projects: &repos.ProjectModel{
			DB: db,
		},
	}

	port := ":8000"
	server := http.Server{
		Addr:    port,
		Handler: app.routes(),
	}

	log.Printf("Listening on %s", port)
	server.ListenAndServe()
}
