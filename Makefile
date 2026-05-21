BINARY      := aycorn
DESKTOP_APP := Aycorn.app
APP_DIR     := app
SRV_DIR     := server
UI_DIST     := $(SRV_DIR)/ui/dist

# Embed the current git tag (e.g. v0.1.0) into the binary at build time.
# Falls back to "dev" when git isn't available or there are no tags yet.
VERSION  := $(shell git describe --tags --always --dirty 2>/dev/null || echo dev)

.PHONY: dev dev-desktop build build-app build-server build-desktop typecheck install upgrade restart clean tidy

# Development: Vite dev server + Go server (two processes, Ctrl-C kills both)
# AYCORN_DB pins the dev DB to server/app.db so it doesn't touch the installed
# binary's DB under ~/Library/Application Support/aycorn (or the OS equivalent).
dev:
	@trap 'kill 0' INT; \
	  cd $(APP_DIR) && npm run dev & \
	  cd $(SRV_DIR) && AYCORN_DB=./app.db go run ./cmd/web; \
	  wait

# Desktop development: native webview window pointing at the Go server.
# Runs build-app first so the embedded UI is current, then opens the webview.
# Use a separate dev.db and port 8001 so it doesn't touch the production instance.
# For frontend hot-reload, use `make dev` (browser) instead.
dev-desktop: build-app
	cd $(SRV_DIR) && go run -tags desktop ./cmd/web --db $(PWD)/$(SRV_DIR)/dev.db --port 8001

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
	cd $(SRV_DIR) && go build -ldflags="-s -w -X main.version=$(VERSION)" -o ../$(BINARY) ./cmd/web
	@echo "Binary ready: ./$(BINARY) ($(VERSION))"

# Desktop app build: native webview window as a macOS .app bundle.
# Output: build/Aycorn.app  (double-click to launch, no terminal)
# Icon:   place a 1024×1024 PNG at build/AppIcon.png before building.
build-desktop: build-app
	@mkdir -p build/$(DESKTOP_APP)/Contents/MacOS build/$(DESKTOP_APP)/Contents/Resources
	cd $(SRV_DIR) && go build -tags desktop \
	  -ldflags="-s -w -X main.version=$(VERSION)" \
	  -o ../build/$(DESKTOP_APP)/Contents/MacOS/Aycorn \
	  ./cmd/web
	@# Convert build/AppIcon.png → AppIcon.icns if the source PNG exists.
	@if [ -f build/AppIcon.png ]; then \
	  rm -rf build/AppIcon.iconset && mkdir build/AppIcon.iconset; \
	  sips -z 16   16   build/AppIcon.png --out build/AppIcon.iconset/icon_16x16.png      > /dev/null; \
	  sips -z 32   32   build/AppIcon.png --out build/AppIcon.iconset/icon_16x16@2x.png   > /dev/null; \
	  sips -z 32   32   build/AppIcon.png --out build/AppIcon.iconset/icon_32x32.png      > /dev/null; \
	  sips -z 64   64   build/AppIcon.png --out build/AppIcon.iconset/icon_32x32@2x.png   > /dev/null; \
	  sips -z 128  128  build/AppIcon.png --out build/AppIcon.iconset/icon_128x128.png    > /dev/null; \
	  sips -z 256  256  build/AppIcon.png --out build/AppIcon.iconset/icon_128x128@2x.png > /dev/null; \
	  sips -z 256  256  build/AppIcon.png --out build/AppIcon.iconset/icon_256x256.png    > /dev/null; \
	  sips -z 512  512  build/AppIcon.png --out build/AppIcon.iconset/icon_256x256@2x.png > /dev/null; \
	  sips -z 512  512  build/AppIcon.png --out build/AppIcon.iconset/icon_512x512.png    > /dev/null; \
	  sips -z 1024 1024 build/AppIcon.png --out build/AppIcon.iconset/icon_512x512@2x.png > /dev/null; \
	  iconutil -c icns build/AppIcon.iconset -o build/$(DESKTOP_APP)/Contents/Resources/AppIcon.icns; \
	  rm -rf build/AppIcon.iconset; \
	  echo "Icon bundled from build/AppIcon.png"; \
	fi
	@printf '%s' '<?xml version="1.0" encoding="UTF-8"?>\n\
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">\n\
<plist version="1.0"><dict>\n\
  <key>CFBundleExecutable</key><string>Aycorn</string>\n\
  <key>CFBundleIconFile</key><string>AppIcon</string>\n\
  <key>CFBundleIdentifier</key><string>com.waseem-polus.aycorn</string>\n\
  <key>CFBundleName</key><string>Aycorn</string>\n\
  <key>CFBundleVersion</key><string>$(VERSION)</string>\n\
  <key>CFBundleShortVersionString</key><string>$(VERSION)</string>\n\
  <key>CFBundlePackageType</key><string>APPL</string>\n\
  <key>NSHighResolutionCapable</key><true/>\n\
  <key>NSAppTransportSecurity</key><dict>\n\
    <key>NSAllowsLocalNetworking</key><true/>\n\
  </dict>\n\
</dict></plist>\n' > build/$(DESKTOP_APP)/Contents/Info.plist
	@echo "Desktop app ready: build/$(DESKTOP_APP)"

# Update Go module dependencies.
tidy:
	cd $(SRV_DIR) && go mod tidy

# Install the binary system-wide so `aycorn` works from anywhere.
# macOS/Linux: copies to /usr/local/bin (may require sudo).
# To uninstall: sudo rm /usr/local/bin/aycorn
install: build
	sudo cp $(BINARY) /usr/local/bin/$(BINARY)
	@echo "Installed: $$(which aycorn)"

# Gracefully stop the running aycorn process (no-op if it isn't running).
# The server handles SIGTERM cleanly — in-flight requests finish before it exits.
restart:
	-pkill -TERM -x aycorn
	@echo "Stopped aycorn (if it was running). Start it again with: aycorn"

# Rebuild, reinstall, and stop the old process. Run after `git pull`.
# Run 'aycorn' afterwards to start the new version.
upgrade:
	$(MAKE) install
	-pkill -TERM -x aycorn
	@echo "Upgraded to $$(aycorn --version). Run 'aycorn' to start."

clean:
	rm -f $(BINARY)
	rm -rf $(UI_DIST) $(APP_DIR)/dist dist-release build/$(DESKTOP_APP) $(SRV_DIR)/cmd/web/build
