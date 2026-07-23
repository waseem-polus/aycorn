package main

import (
	"database/sql"
	"fmt"
	"io"
	"io/fs"
	"log"
	"os"
	"os/exec"
	"path/filepath"
	"sort"
	"strconv"
	"strings"
	"time"

	"github.com/pressly/goose/v3"
	"github.com/waseem-polus/aycorn/server/internal/migrations"
)

// defaultBackupKeep is how many rotating snapshots to retain in the backups dir
// when AYCORN_BACKUP_KEEP is unset.
const defaultBackupKeep = 10

// resolveBackupDir returns the directory snapshots live in: a "backups" folder
// alongside the DB file. So `make dev` snapshots land in server/backups/ and an
// installed binary's land next to its app.db under the OS config dir.
func resolveBackupDir(dbPath string) string {
	return filepath.Join(filepath.Dir(dbPath), "backups")
}

// timestampedName builds a snapshot filename like app-20060102-150405<suffix>.db.
func timestampedName(suffix string) string {
	return fmt.Sprintf("app-%s%s.db", time.Now().Format("20060102-150405"), suffix)
}

// backupKeep reads the retention count from AYCORN_BACKUP_KEEP (0 = keep all),
// falling back to defaultBackupKeep.
func backupKeep() int {
	if v := os.Getenv("AYCORN_BACKUP_KEEP"); v != "" {
		if n, err := strconv.Atoi(v); err == nil && n >= 0 {
			return n
		}
	}
	return defaultBackupKeep
}

// snapshot writes a consistent, defragmented copy of the live DB to dest using
// SQLite's VACUUM INTO (safe even while the DB is in use, journal-mode agnostic).
// VACUUM INTO refuses to overwrite, so we guard explicitly for a clearer error.
func snapshot(db *sql.DB, dest string) error {
	if _, err := os.Stat(dest); err == nil {
		return fmt.Errorf("refusing to overwrite existing file %s", dest)
	} else if !os.IsNotExist(err) {
		return err
	}
	if err := os.MkdirAll(filepath.Dir(dest), 0o755); err != nil {
		return err
	}
	if _, err := db.Exec("VACUUM INTO ?", dest); err != nil {
		return fmt.Errorf("snapshot to %s: %w", dest, err)
	}
	return nil
}

// rotateBackups keeps only the newest keep snapshots matching app-*.db in dir,
// deleting the rest. keep <= 0 means keep everything. The timestamp in each
// filename is fixed-width, so a lexical sort is chronological.
func rotateBackups(dir string, keep int) {
	if keep <= 0 {
		return
	}
	matches, err := filepath.Glob(filepath.Join(dir, "app-*.db"))
	if err != nil {
		log.Printf("backup rotation: %v", err)
		return
	}
	if len(matches) <= keep {
		return
	}
	sort.Strings(matches)
	for _, old := range matches[:len(matches)-keep] {
		if err := os.Remove(old); err != nil {
			log.Printf("backup rotation: could not remove %s: %v", old, err)
		}
	}
}

// latestMigrationVersion returns the highest migration version embedded in the
// binary, parsed from the leading NNNNN of each sql/*.sql filename.
func latestMigrationVersion() (int64, error) {
	entries, err := fs.ReadDir(migrations.Files, "sql")
	if err != nil {
		return 0, err
	}
	var latest int64
	for _, e := range entries {
		name := e.Name()
		if !strings.HasSuffix(name, ".sql") {
			continue
		}
		idx := strings.IndexByte(name, '_')
		if idx <= 0 {
			continue
		}
		n, err := strconv.ParseInt(name[:idx], 10, 64)
		if err != nil {
			continue
		}
		if n > latest {
			latest = n
		}
	}
	return latest, nil
}

// backupBeforeMigrate snapshots the DB before any pending migration runs, so an
// upgrade can never silently lose data. No-op when the DB is already at the
// latest version. On failure it returns an error — the caller aborts startup
// rather than migrate unprotected.
func backupBeforeMigrate(db *sql.DB, dbPath string) error {
	current, err := goose.GetDBVersion(db)
	if err != nil {
		return err
	}
	latest, err := latestMigrationVersion()
	if err != nil {
		return err
	}
	if current >= latest {
		return nil
	}
	dir := resolveBackupDir(dbPath)
	dest := filepath.Join(dir, timestampedName(fmt.Sprintf("-pre-v%d", latest)))
	if err := snapshot(db, dest); err != nil {
		return fmt.Errorf("pre-migration backup failed (refusing to migrate unprotected): %w", err)
	}
	rotateBackups(dir, backupKeep())
	log.Printf("Pre-migration backup written to %s (db v%d → v%d)", dest, current, latest)
	return nil
}

// runBackup handles `aycorn backup [dest]`: a clean, on-demand snapshot. With no
// dest it writes a rotating, timestamped file into the backups dir.
func runBackup(args []string) error {
	dbPath, err := resolveDBPath()
	if err != nil {
		return err
	}
	if fi, err := os.Stat(dbPath); err != nil || fi.Size() == 0 {
		return fmt.Errorf("no database at %s to back up", dbPath)
	}

	db, err := sql.Open("sqlite", dbPath+"?_pragma=foreign_keys(1)")
	if err != nil {
		return err
	}
	defer db.Close()

	var dest string
	rotate := false
	if len(args) > 0 && args[0] != "" {
		dest = args[0]
	} else {
		dest = filepath.Join(resolveBackupDir(dbPath), timestampedName(""))
		rotate = true
	}

	if err := snapshot(db, dest); err != nil {
		return err
	}
	if rotate {
		rotateBackups(resolveBackupDir(dbPath), backupKeep())
	}

	abs, err := filepath.Abs(dest)
	if err != nil {
		abs = dest
	}
	fmt.Printf("Backup written to %s\n", abs)
	return nil
}

// runRestore handles `aycorn restore <src>`: install a snapshot as the live DB
// (for moving to new hardware or rolling back). It validates the snapshot, backs
// up the current DB first so the restore itself is reversible, then swaps the
// file in. The next `aycorn` run migrates the schema forward via goose.
func runRestore(args []string) error {
	if len(args) == 0 || args[0] == "" {
		return fmt.Errorf("usage: aycorn restore <snapshot.db>")
	}
	src := args[0]
	if _, err := os.Stat(src); err != nil {
		return fmt.Errorf("snapshot not found: %s", src)
	}

	// Best-effort guard; the pre-restore snapshot below is the real protection.
	if aycornRunning() {
		return fmt.Errorf("an aycorn server appears to be running — stop it first (`make stop` or `pkill aycorn`) before restoring")
	}

	if err := integrityCheck(src); err != nil {
		return err
	}

	dbPath, err := resolveDBPath()
	if err != nil {
		return err
	}

	// Snapshot the current DB first so restore is reversible.
	if fi, err := os.Stat(dbPath); err == nil && fi.Size() > 0 {
		db, err := sql.Open("sqlite", dbPath+"?_pragma=foreign_keys(1)")
		if err != nil {
			return err
		}
		dest := filepath.Join(resolveBackupDir(dbPath), timestampedName("-pre-restore"))
		err = snapshot(db, dest)
		db.Close()
		if err != nil {
			return fmt.Errorf("could not back up current DB before restore: %w", err)
		}
		fmt.Printf("Backed up current database to %s\n", dest)
	}

	if err := copyFile(src, dbPath); err != nil {
		return err
	}
	fmt.Printf("Restored %s → %s\n", src, dbPath)
	fmt.Println("Stop any running server before restoring. Run `aycorn` to start; migrations will roll the schema forward.")
	return nil
}

// integrityCheck opens path as a SQLite DB and runs PRAGMA integrity_check.
func integrityCheck(path string) error {
	db, err := sql.Open("sqlite", path)
	if err != nil {
		return err
	}
	defer db.Close()
	var result string
	if err := db.QueryRow("PRAGMA integrity_check").Scan(&result); err != nil {
		return fmt.Errorf("could not read %s as a SQLite database: %w", path, err)
	}
	if result != "ok" {
		return fmt.Errorf("snapshot failed integrity check: %s", result)
	}
	return nil
}

// aycornRunning best-effort detects an installed aycorn binary by process name.
// It won't catch a `go run ./cmd/web` dev session (the process isn't named
// "aycorn"); the pre-restore snapshot covers that gap. The current process is
// excluded so `aycorn restore` doesn't flag itself.
func aycornRunning() bool {
	out, err := exec.Command("pgrep", "-x", "aycorn").Output()
	if err != nil {
		return false
	}
	self := os.Getpid()
	for _, field := range strings.Fields(string(out)) {
		pid, err := strconv.Atoi(field)
		if err != nil {
			continue
		}
		if pid != self {
			return true
		}
	}
	return false
}

// copyFile copies src to dst, creating parent dirs as needed.
func copyFile(src, dst string) error {
	if err := os.MkdirAll(filepath.Dir(dst), 0o755); err != nil {
		return err
	}
	in, err := os.Open(src)
	if err != nil {
		return err
	}
	defer in.Close()
	out, err := os.Create(dst)
	if err != nil {
		return err
	}
	if _, err := io.Copy(out, in); err != nil {
		out.Close()
		return err
	}
	return out.Close()
}
