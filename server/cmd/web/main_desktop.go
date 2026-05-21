//go:build desktop

package main

import (
	"context"
	"fmt"
	"log"
	"net/http"
	"time"

	webview "github.com/webview/webview_go"
)

func main() {
	dbPath, err := resolveDBPath()
	if err != nil {
		log.Fatal(err)
	}
	log.Printf("Using database at %s", dbPath)

	db, err := setupDB(dbPath)
	if err != nil {
		log.Fatal(err)
	}

	ln, port, err := findAvailablePort(resolvePort())
	if err != nil {
		log.Fatal(err)
	}

	a := newApp(db)
	srv := &http.Server{Handler: a.routes()}
	go func() {
		log.Printf("Listening on http://localhost:%d", port)
		if err := srv.Serve(ln); err != nil && err != http.ErrServerClosed {
			log.Fatal(err)
		}
	}()

	w := webview.New(false)
	defer w.Destroy()
	w.SetTitle("Aycorn")
	w.SetSize(1280, 800, webview.HintNone)
	w.Navigate(fmt.Sprintf("http://localhost:%d", port))
	w.Run() // blocks until the window is closed

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()
	srv.Shutdown(ctx)
	db.Close()
}
