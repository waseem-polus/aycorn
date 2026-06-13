BINARY   := aycorn
APP_DIR  := app
SRV_DIR  := server
UI_DIST  := $(SRV_DIR)/ui/dist

# Embed the current git tag (e.g. v0.1.0) into the binary at build time.
# Falls back to "dev" when git isn't available or there are no tags yet.
VERSION  := $(shell git describe --tags --always --dirty 2>/dev/null || echo dev)

.PHONY: dev build build-app build-app-dev build-server typecheck install upgrade stop clean backup restore

# Development: build frontend with dev icon, then start Go server.
# AYCORN_DB pins the dev DB to server/app.db so it doesn't touch the installed
# binary's DB under ~/Library/Application Support/aycorn (or the OS equivalent).
dev: build-app-dev
	@trap 'kill 0' INT; \
    cd $(SRV_DIR) && AYCORN_DB=./app.db go run ./cmd/web; \
    wait

# Full release build: React → embed → single Go binary
build: build-app build-server

build-app:
	cd $(APP_DIR) && npm run build

build-app-dev:
	cd $(APP_DIR) && npx vite build --mode development

# Run TypeScript type check without building
typecheck:
	cd $(APP_DIR) && npx tsc -b --noEmit

build-server:
	cd $(SRV_DIR) && go build -ldflags="-s -w -X main.version=$(VERSION)" -o ../$(BINARY) ./cmd/web
	@echo "Binary ready: ./$(BINARY) ($(VERSION))"

# Install the binary system-wide so `aycorn` works from anywhere.
# macOS/Linux: copies to /usr/local/bin (may require sudo).
# To uninstall: sudo rm /usr/local/bin/aycorn
install: build
	sudo cp $(BINARY) /usr/local/bin/$(BINARY)
	@echo "Installed: $$(which aycorn)"

# Gracefully stop the running aycorn process (no-op if it isn't running).
# The server handles SIGTERM cleanly — in-flight requests finish before it exits.
stop:
	-pkill -TERM -x aycorn
	@echo "Stopped aycorn (if it was running). Run 'aycorn' to start again."

# Rebuild, reinstall, and stop the old process. Run after `git pull`.
# Run 'aycorn' afterwards to start the new version. The next start automatically
# snapshots the DB before applying any schema migration, so upgrades can't lose data.
upgrade:
	$(MAKE) install
	@echo "Upgraded to $$(aycorn --version)"
	$(MAKE) stop

# Snapshot / restore the DEV database (server/app.db) via the binary's subcommands.
# These operate on the dev DB only (AYCORN_DB=./app.db); the installed binary's
# `aycorn backup` / `aycorn restore` act on your real data under the OS config dir.
backup:
	cd $(SRV_DIR) && AYCORN_DB=./app.db go run ./cmd/web backup $(DEST)

restore:
	cd $(SRV_DIR) && AYCORN_DB=./app.db go run ./cmd/web restore $(SRC)

clean:
	rm -f $(BINARY)
	rm -rf $(UI_DIST) dist-release
