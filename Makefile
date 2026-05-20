BINARY   := aycorn
APP_DIR  := app
SRV_DIR  := server
UI_DIST  := $(SRV_DIR)/ui/dist

.PHONY: dev build build-app build-server typecheck clean

# Development: Vite dev server + Go server (two processes, Ctrl-C kills both)
# AYCORN_DB pins the dev DB to server/app.db so it doesn't touch the installed
# binary's DB under ~/Library/Application Support/aycorn (or the OS equivalent).
dev:
	@trap 'kill 0' INT; \
	  cd $(APP_DIR) && npm run dev & \
	  cd $(SRV_DIR) && AYCORN_DB=./app.db go run ./cmd/web; \
	  wait

# Full release build: React → embed → single Go binary
build: build-app build-server

build-app:
	cd $(APP_DIR) && npx vite build
	mkdir -p $(UI_DIST)
	cp -r $(APP_DIR)/dist/. $(UI_DIST)/

# Run TypeScript type check without building
typecheck:
	cd $(APP_DIR) && npx tsc -b --noEmit

build-server:
	cd $(SRV_DIR) && go build -o ../$(BINARY) ./cmd/web
	@echo "Binary ready: ./$(BINARY)"

# Install the binary system-wide so `aycorn` works from anywhere.
# macOS/Linux: copies to /usr/local/bin (may require sudo).
# To uninstall: sudo rm /usr/local/bin/aycorn
install: build
	sudo cp $(BINARY) /usr/local/bin/$(BINARY)
	@echo "Installed: $$(which aycorn)"

clean:
	rm -f $(BINARY)
	rm -rf $(UI_DIST) $(APP_DIR)/dist dist-release
