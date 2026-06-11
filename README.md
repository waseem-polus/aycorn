# Aycorn

A personal, self-hosted task manager that blends Jira-style project tracking with Notion-style flexibility. Runs entirely on your machine — no account, no cloud, no subscription.

---

## Install from a pre-built binary (recommended)

A binary is a ready-to-run program — no compiler, no dependencies, no installation wizard. Just download it and run it.

### macOS

1. Go to the [Releases page](../../releases/latest) and download `aycorn-darwin-arm64`.

2. Open Terminal and run the following commands (replace `~/Downloads/aycorn-darwin-arm64` with the actual path to the file you downloaded):

   ```bash
   # Make the file executable
   chmod +x ~/Downloads/aycorn-darwin-arm64

   # Remove the macOS quarantine flag (see Troubleshooting if you skip this)
   xattr -d com.apple.quarantine ~/Downloads/aycorn-darwin-arm64

   # Move it to /usr/local/bin — a folder your system checks when you type a command,
   # so you can run 'aycorn' from anywhere without typing the full path
   sudo mv ~/Downloads/aycorn-darwin-arm64 /usr/local/bin/aycorn
   ```

   `sudo` will ask for your Mac login password.

3. Start Aycorn:
   ```bash
   aycorn
   ```

4. Open the URL shown in the terminal (e.g. **http://localhost:8000**) in your browser.

---

### Linux

1. Go to the [Releases page](../../releases/latest) and download `aycorn-linux-amd64`.

2. In your terminal:

   ```bash
   chmod +x ~/Downloads/aycorn-linux-amd64
   sudo mv ~/Downloads/aycorn-linux-amd64 /usr/local/bin/aycorn
   ```

3. Start Aycorn:
   ```bash
   aycorn
   ```

4. Open the URL shown in the terminal (e.g. **http://localhost:8000**) in your browser.

---

### Windows

1. Go to the [Releases page](../../releases/latest) and download `aycorn-windows-amd64.exe`.

2. Create a folder to keep your personal tools, for example `C:\Users\<YourName>\bin`.

3. Move the downloaded file into that folder and rename it to `aycorn.exe`.

4. Add the folder to your PATH so Windows can find it:
   - Press `Win + R`, type `sysdm.cpl`, press Enter.
   - Click **Advanced** → **Environment Variables**.
   - Under **User variables**, select **Path** and click **Edit**.
   - Click **New** and paste the folder path (e.g. `C:\Users\<YourName>\bin`).
   - Click OK on all dialogs.

5. Open a new Command Prompt or PowerShell window (the PATH change won't apply to windows already open), then run:
   ```
   aycorn
   ```

6. Open the URL shown in the terminal (e.g. **http://localhost:8000**) in your browser.

---

## Build from source

Use this path if you want to contribute, if you're on an unsupported platform, or if you simply prefer to build your own binaries.

**Prerequisites:**
- [Go](https://go.dev/dl/) 1.22 or later
- [Node.js](https://nodejs.org/) 22 or later
- `make` — comes pre-installed on macOS and Linux; Windows users can use [Git Bash](https://gitforwindows.org/) or [WSL](https://learn.microsoft.com/en-us/windows/wsl/)

**Steps:**

1. Clone the repository:
   ```bash
   git clone https://github.com/waseem-polus/aycorn.git
   cd aycorn
   ```

2. Build and install in one step:
   ```bash
   make install
   ```
   This builds the React frontend, bundles it into the Go binary, and copies the result to `/usr/local/bin/aycorn`. It will ask for your password once (needed to write to `/usr/local/bin`).

3. Start Aycorn:
   ```bash
   aycorn
   ```

4. Open the URL shown in the terminal (e.g. **http://localhost:8000**) in your browser.

---

## Running Aycorn

```bash
aycorn
```

Aycorn starts a local web server and prints where your database lives and which port it's on:
```
2025/01/01 12:00:00 Using database at /Users/you/Library/Application Support/aycorn/app.db
2025/01/01 12:00:00 Listening on http://localhost:8000
```

Open the URL from the `Listening on` line in your browser. Aycorn defaults to port 8000, but automatically tries the next port up if 8000 is already in use. Aycorn runs entirely on your machine — nothing is sent anywhere.

**To stop it:** press `Ctrl-C` in the terminal where it's running. Aycorn waits for any in-progress requests to finish before it exits.

**To check the version:**
```bash
aycorn --version
```

**To back up or restore your data:** see [Backup & migrating to a new machine](#backup--migrating-to-a-new-machine).

---

## Upgrading

### From a binary install

1. Download the new binary from the [Releases page](../../releases/latest) (same file you downloaded originally).
2. Stop the running Aycorn (`Ctrl-C` in its terminal, or `pkill -TERM -x aycorn`).
3. Repeat the install step — move the new file to `/usr/local/bin/aycorn` (overwriting the old one).
4. Run `aycorn` to start the new version.

Your database is stored separately from the binary, so your data is never affected by an upgrade. And if a new version needs to update the database schema, Aycorn automatically snapshots your database first — see [Backup & migrating to a new machine](#backup--migrating-to-a-new-machine).

### From a source build

```bash
git pull        # fetch the latest changes (review what's new before this if you like)
make upgrade    # rebuild, reinstall, and stop the old process
aycorn          # start the new version
```

---

## Where your data lives

Aycorn stores everything in a single SQLite database file. Its location depends on your operating system:

| OS | Database path |
|---|---|
| macOS | `~/Library/Application Support/aycorn/app.db` |
| Linux | `~/.config/aycorn/app.db` |
| Windows | `C:\Users\<YourName>\AppData\Roaming\aycorn\app.db` |

Aycorn prints the exact path on startup — look for the `Using database at` line.

**To inspect or query your data directly**, you can use the `sqlite3` command-line tool:

```bash
# macOS
sqlite3 "$HOME/Library/Application Support/aycorn/app.db"

# Linux
sqlite3 "$HOME/.config/aycorn/app.db"
```

> `sqlite3` comes pre-installed on macOS. On Linux, install it with `sudo apt install sqlite3` (Ubuntu/Debian) or `sudo dnf install sqlite` (Fedora). A graphical alternative is [DB Browser for SQLite](https://sqlitebrowser.org/).

**To use a custom database location** (useful for testing or running multiple instances):
```bash
AYCORN_DB=/path/to/my.db aycorn
```

---

## Backup & migrating to a new machine

Because all your data lives in one SQLite file, backing up and moving Aycorn is just a matter of snapshotting that file safely. Aycorn does this for you with `VACUUM INTO`, which produces a clean, consistent copy even while the app is running.

### Automatic backups on upgrade

Every time Aycorn starts and finds that a new version needs to update the database schema, it **automatically snapshots your database first** — before applying any change. So an upgrade can never silently lose data; the previous state is always saved.

Snapshots live in a `backups/` folder next to your database, named by timestamp (e.g. `app-20260611-091500-pre-v5.db`). Aycorn keeps the **10 most recent** by default; set `AYCORN_BACKUP_KEEP` to change that (`0` keeps all):

```bash
AYCORN_BACKUP_KEEP=20 aycorn
```

### Manual backup

Make an on-demand snapshot at any time:

```bash
aycorn backup                      # writes a timestamped file into the backups/ folder
aycorn backup ~/aycorn-backup.db   # or write to a path you choose
```

### Restore / move to new hardware

To move your data to a new machine (or roll back to a snapshot):

```bash
# On the old machine — make a clean snapshot and copy it over
aycorn backup ~/aycorn-snapshot.db
scp ~/aycorn-snapshot.db newhost:~/

# On the new machine — install Aycorn first, then:
aycorn restore ~/aycorn-snapshot.db   # validates the snapshot, backs up any existing DB, installs it
aycorn                                # start normally; the schema rolls forward automatically
```

`restore` checks the snapshot is a healthy SQLite database, backs up your current database first (so the restore is itself reversible), then swaps the file in. **Stop any running Aycorn before restoring.**

> The version you install on the new machine must be the **same or newer** than the one the snapshot came from — Aycorn only upgrades a database forward, never downgrades it.

---

## Make commands (for source builders)

| Command | What it does |
|---|---|
| `make dev` | Start a local dev environment: hot-reloading frontend + Go backend. Uses a separate dev database (`server/app.db`) so it doesn't touch your installed data. |
| `make build` | Build the production binary (React + Go bundled together) at `./aycorn`. |
| `make install` | Build and copy the binary to `/usr/local/bin/aycorn` so you can run it from anywhere. |
| `make upgrade` | Rebuild, reinstall, and stop the running instance. Run after `git pull`. Then run `aycorn` to start the new version. |
| `make stop` | Gracefully stop the running `aycorn` process. Does nothing if it isn't running. |
| `make typecheck` | Run the TypeScript type checker on the frontend without building. |
| `make clean` | Delete the built binary and frontend build artifacts. |
| `make backup` | Snapshot the dev database (`server/app.db`). Pass `DEST=path` to choose where it's written. Acts on the dev DB only — not your installed data. |
| `make restore` | Restore the dev database from a snapshot. Pass `SRC=path` for the snapshot to restore. Acts on the dev DB only. |

---

## Troubleshooting

### Aycorn started on an unexpected port

If the default port (8000) is already in use by something else, Aycorn automatically tries 8001, then 8002, and so on — up to 10 attempts. It always prints the URL it actually landed on:

```
Listening on http://localhost:8001
```

If you want Aycorn to always use a specific port, set it once in your shell profile (e.g. `~/.zshrc` or `~/.bashrc`):

```bash
export AYCORN_PORT=9000
```

Or pass it as a flag each time:

```bash
aycorn --port 9000
```

If all 10 ports in the range are occupied, Aycorn will exit with an error telling you to pick a different starting port using one of the methods above.

---

### macOS: "Apple could not verify this app is free of malware"

This happens because the binary isn't signed with an Apple Developer certificate. It's a standard macOS security prompt for software downloaded from the internet — it doesn't mean the software is harmful.

**Option 1 — Remove the quarantine flag (recommended):**
```bash
xattr -d com.apple.quarantine /usr/local/bin/aycorn
```

**Option 2 — Allow it through System Settings:**
Go to **System Settings → Privacy & Security**, scroll down, and click **Open Anyway** next to the aycorn entry.

**Option 3 — Right-click to open the first time:**
Right-click the file in Finder and choose **Open** (not double-click). A different dialog appears that includes an **Open** button.

After doing any of the above once, macOS will remember and won't ask again.

---

### Windows: "Windows protected your PC" (SmartScreen)

SmartScreen shows this warning for executable files downloaded from the internet that don't have a code-signing certificate. It's the Windows equivalent of the macOS Gatekeeper prompt.

Click **More info**, then click **Run anyway**. Windows will remember your choice for this file.

---

### "My data is empty" / "I don't see my tasks"

Aycorn is probably looking at a different database file than you expect. Check the startup log:
```
Using database at /Users/you/Library/Application Support/aycorn/app.db
```

If it's pointing at the wrong file, use `AYCORN_DB` to tell it exactly where to look:
```bash
AYCORN_DB="/path/to/your/app.db" aycorn
```

---

### `make upgrade` says "Already up to date" but the version didn't change

This means git already has the latest code — there's nothing new to pull. Possible reasons:
- You're building from a branch that hasn't been tagged yet. The version will show as something like `v0.1.0-3-gabcdef` (3 commits past the last tag).
- You have local uncommitted changes, which adds `-dirty` to the version string.

Run `aycorn --version` to see exactly what version is installed.
