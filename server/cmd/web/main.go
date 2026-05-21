//go:build !desktop

package main

import (
	"context"
	"fmt"
	"log"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"
)

func main() {
	if len(os.Args) > 1 && (os.Args[1] == "--version" || os.Args[1] == "version") {
		fmt.Println(version)
		os.Exit(0)
	}

	dbPath, err := resolveDBPath()
	if err != nil {
		log.Fatal(err)
	}
	log.Printf("Using database at %s", dbPath)

	db, err := setupDB(dbPath)
	if err != nil {
		log.Fatal(err)
	}
	defer db.Close()

	a := newApp(db)

	ln, port, err := findAvailablePort(resolvePort())
	if err != nil {
		log.Fatal(err)
	}

	server := http.Server{Handler: a.routes()}

	// Start the server in a goroutine so we can listen for shutdown signals.
	go func() {
		log.Printf("Listening on http://localhost:%d", port)
		if err := server.Serve(ln); err != nil && err != http.ErrServerClosed {
			log.Fatal(err)
		}
	}()

	// Block until SIGINT (Ctrl-C) or SIGTERM (kill / make upgrade).
	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
	<-quit

	log.Println("Shutting down — waiting for in-flight requests to finish...")
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()
	if err := server.Shutdown(ctx); err != nil {
		log.Fatal("Forced shutdown:", err)
	}
	log.Println("Done")
}
