package main

import (
	"io/fs"
	"net/http"
	"strings"

	"github.com/waseem-polus/aycorn/server/ui"
)

// spaHandler serves the embedded React SPA. Any path that doesn't match a
// real file in dist/ falls back to index.html so that client-side routing
// (TanStack Router) handles it. Returns nil when the UI hasn't been built yet
// (dist/ only contains .gitkeep), so the server skips SPA registration and
// serves the API only — which is the normal dev setup.
func spaHandler() http.Handler {
	dist, err := fs.Sub(ui.Files, "dist")
	if err != nil {
		return nil
	}
	if _, err := dist.Open("index.html"); err != nil {
		return nil
	}

	fsHandler := http.FileServer(http.FS(dist))
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		path := strings.TrimPrefix(r.URL.Path, "/")
		if _, err := dist.Open(path); err != nil {
			r.URL.Path = "/"
		}
		fsHandler.ServeHTTP(w, r)
	})
}
