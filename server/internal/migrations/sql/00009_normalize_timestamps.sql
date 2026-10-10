-- +goose Up
-- Normalize every stored timestamp to one canonical encoding:
-- 'YYYY-MM-DDTHH:MM:SSZ' (RFC3339, second precision, UTC).
--
-- Why: four encodings had accumulated in the same columns, written by four
-- different paths --
--   A  '2026-06-13 05:00:00 +0000 UTC'  Go time.Time.String(), the modernc
--                                       driver's default bind format
--   B  '2026-08-12T05:00:00.000Z'       the browser's toISOString(), stored
--                                       verbatim by the bulk-update path
--   C  '2025-01-06 09:00:00+00:00'      a since-removed write path
--   D  '2025-01-05 09:30:00'            CURRENT_TIMESTAMP and seed literals
--
-- SQLite compares these as plain strings, so mixed encodings broke both range
-- filters and ORDER BY: for the same instant, a space-separated value always
-- sorts below a 'T'-separated one (' ' is 0x20, 'T' is 0x54). Worse, form A is
-- not parseable by SQLite's date functions at all, so DATE(col) returned NULL
-- and those rows were silently dropped by every date filter.
--
-- The canonical form makes lexicographic order equal chronological order and is
-- parseable by date()/datetime(). It is the format the newer tables' triggers
-- (task_type, project_folder, ...) already use.
--
-- The normalization expression is:
--   strftime('%Y-%m-%dT%H:%M:%SZ', replace(replace(col, ' +0000 UTC', 'Z'), ' ', 'T'))
-- which handles all four forms and is idempotent on already-canonical values.
-- Every UPDATE repeats that expression in its WHERE clause and requires it to
-- be NOT NULL: any value the expression cannot parse (e.g. a non-UTC Go
-- timestamp) is left untouched rather than nulled out.

-- 1. Drop the triggers that would otherwise fire on the rewrite below.
--    The timeModified bumps would stamp every row with today's date and cascade
--    up task -> checklist -> project, destroying real modification history.
DROP TRIGGER IF EXISTS setTaskTimeModified;
DROP TRIGGER IF EXISTS cascadeTaskUpdateToParents;
DROP TRIGGER IF EXISTS setChecklistTimeModified;
DROP TRIGGER IF EXISTS cascadeChecklistUpdateToProject;
DROP TRIGGER IF EXISTS setProjectTimeModified;
DROP TRIGGER IF EXISTS setStageTimeModified;
DROP TRIGGER IF EXISTS cascadeStageUpdateToWorkflow;
DROP TRIGGER IF EXISTS setWorkflowTimeModified;

-- 2. Rewrite task planned dates.
--    timePlannedStart and timePlannedEnd MUST be normalized in a single
--    statement: checkTimePlannedEnd_Update compares them as strings, so an
--    intermediate state with one column canonical and the other not would
--    compare ' ' against 'T' and abort the migration.
UPDATE task
   SET timePlannedStart = strftime('%Y-%m-%dT%H:%M:%SZ', replace(replace(timePlannedStart, ' +0000 UTC', 'Z'), ' ', 'T')),
       timePlannedEnd   = strftime('%Y-%m-%dT%H:%M:%SZ', replace(replace(timePlannedEnd,   ' +0000 UTC', 'Z'), ' ', 'T'))
 WHERE (timePlannedStart IS NULL OR strftime('%Y-%m-%dT%H:%M:%SZ', replace(replace(timePlannedStart, ' +0000 UTC', 'Z'), ' ', 'T')) IS NOT NULL)
   AND (timePlannedEnd   IS NULL OR strftime('%Y-%m-%dT%H:%M:%SZ', replace(replace(timePlannedEnd,   ' +0000 UTC', 'Z'), ' ', 'T')) IS NOT NULL)
   AND (timePlannedStart IS NOT NULL OR timePlannedEnd IS NOT NULL);

UPDATE task
   SET timeCompleted = strftime('%Y-%m-%dT%H:%M:%SZ', replace(replace(timeCompleted, ' +0000 UTC', 'Z'), ' ', 'T'))
 WHERE timeCompleted IS NOT NULL
   AND strftime('%Y-%m-%dT%H:%M:%SZ', replace(replace(timeCompleted, ' +0000 UTC', 'Z'), ' ', 'T')) IS NOT NULL;

-- 3. Rewrite timeCreated / timeModified everywhere, so ordering by them is
--    consistent with the rest of the schema.
UPDATE task      SET timeCreated = strftime('%Y-%m-%dT%H:%M:%SZ', replace(replace(timeCreated, ' +0000 UTC', 'Z'), ' ', 'T')) WHERE timeCreated IS NOT NULL AND strftime('%Y-%m-%dT%H:%M:%SZ', replace(replace(timeCreated, ' +0000 UTC', 'Z'), ' ', 'T')) IS NOT NULL;
UPDATE task      SET timeModified = strftime('%Y-%m-%dT%H:%M:%SZ', replace(replace(timeModified, ' +0000 UTC', 'Z'), ' ', 'T')) WHERE timeModified IS NOT NULL AND strftime('%Y-%m-%dT%H:%M:%SZ', replace(replace(timeModified, ' +0000 UTC', 'Z'), ' ', 'T')) IS NOT NULL;
UPDATE checklist SET timeCreated = strftime('%Y-%m-%dT%H:%M:%SZ', replace(replace(timeCreated, ' +0000 UTC', 'Z'), ' ', 'T')) WHERE timeCreated IS NOT NULL AND strftime('%Y-%m-%dT%H:%M:%SZ', replace(replace(timeCreated, ' +0000 UTC', 'Z'), ' ', 'T')) IS NOT NULL;
UPDATE checklist SET timeModified = strftime('%Y-%m-%dT%H:%M:%SZ', replace(replace(timeModified, ' +0000 UTC', 'Z'), ' ', 'T')) WHERE timeModified IS NOT NULL AND strftime('%Y-%m-%dT%H:%M:%SZ', replace(replace(timeModified, ' +0000 UTC', 'Z'), ' ', 'T')) IS NOT NULL;
UPDATE project   SET timeCreated = strftime('%Y-%m-%dT%H:%M:%SZ', replace(replace(timeCreated, ' +0000 UTC', 'Z'), ' ', 'T')) WHERE timeCreated IS NOT NULL AND strftime('%Y-%m-%dT%H:%M:%SZ', replace(replace(timeCreated, ' +0000 UTC', 'Z'), ' ', 'T')) IS NOT NULL;
UPDATE project   SET timeModified = strftime('%Y-%m-%dT%H:%M:%SZ', replace(replace(timeModified, ' +0000 UTC', 'Z'), ' ', 'T')) WHERE timeModified IS NOT NULL AND strftime('%Y-%m-%dT%H:%M:%SZ', replace(replace(timeModified, ' +0000 UTC', 'Z'), ' ', 'T')) IS NOT NULL;
UPDATE stage     SET timeCreated = strftime('%Y-%m-%dT%H:%M:%SZ', replace(replace(timeCreated, ' +0000 UTC', 'Z'), ' ', 'T')) WHERE timeCreated IS NOT NULL AND strftime('%Y-%m-%dT%H:%M:%SZ', replace(replace(timeCreated, ' +0000 UTC', 'Z'), ' ', 'T')) IS NOT NULL;
UPDATE stage     SET timeModified = strftime('%Y-%m-%dT%H:%M:%SZ', replace(replace(timeModified, ' +0000 UTC', 'Z'), ' ', 'T')) WHERE timeModified IS NOT NULL AND strftime('%Y-%m-%dT%H:%M:%SZ', replace(replace(timeModified, ' +0000 UTC', 'Z'), ' ', 'T')) IS NOT NULL;
UPDATE workflow  SET timeCreated = strftime('%Y-%m-%dT%H:%M:%SZ', replace(replace(timeCreated, ' +0000 UTC', 'Z'), ' ', 'T')) WHERE timeCreated IS NOT NULL AND strftime('%Y-%m-%dT%H:%M:%SZ', replace(replace(timeCreated, ' +0000 UTC', 'Z'), ' ', 'T')) IS NOT NULL;
UPDATE workflow  SET timeModified = strftime('%Y-%m-%dT%H:%M:%SZ', replace(replace(timeModified, ' +0000 UTC', 'Z'), ' ', 'T')) WHERE timeModified IS NOT NULL AND strftime('%Y-%m-%dT%H:%M:%SZ', replace(replace(timeModified, ' +0000 UTC', 'Z'), ' ', 'T')) IS NOT NULL;

-- 4. Recreate the triggers, writing the canonical format instead of
--    CURRENT_TIMESTAMP (which renders as form D, '2026-08-27 02:40:25').

-- +goose StatementBegin
CREATE TRIGGER setTaskTimeModified
AFTER UPDATE ON task
FOR EACH ROW
WHEN NEW.timeModified IS OLD.timeModified
BEGIN
    UPDATE task SET timeModified = strftime('%Y-%m-%dT%H:%M:%SZ', 'now') WHERE id = NEW.id;
END;
-- +goose StatementEnd

-- +goose StatementBegin
CREATE TRIGGER cascadeTaskUpdateToParents
AFTER UPDATE ON task
FOR EACH ROW
BEGIN
    UPDATE checklist SET timeModified = strftime('%Y-%m-%dT%H:%M:%SZ', 'now')
      WHERE id = NEW.checklist;
    UPDATE project SET timeModified = strftime('%Y-%m-%dT%H:%M:%SZ', 'now')
      WHERE id = (SELECT project FROM checklist WHERE id = NEW.checklist);
END;
-- +goose StatementEnd

-- +goose StatementBegin
CREATE TRIGGER setChecklistTimeModified
AFTER UPDATE ON checklist
FOR EACH ROW
WHEN NEW.timeModified IS OLD.timeModified
BEGIN
    UPDATE checklist SET timeModified = strftime('%Y-%m-%dT%H:%M:%SZ', 'now') WHERE id = NEW.id;
END;
-- +goose StatementEnd

-- +goose StatementBegin
CREATE TRIGGER cascadeChecklistUpdateToProject
AFTER UPDATE ON checklist
FOR EACH ROW
BEGIN
    UPDATE project SET timeModified = strftime('%Y-%m-%dT%H:%M:%SZ', 'now')
      WHERE id = NEW.project;
END;
-- +goose StatementEnd

-- +goose StatementBegin
CREATE TRIGGER setProjectTimeModified
AFTER UPDATE ON project
FOR EACH ROW
WHEN NEW.timeModified IS OLD.timeModified
 AND (NEW.name IS NOT OLD.name OR NEW.workflow IS NOT OLD.workflow)
BEGIN
    UPDATE project SET timeModified = strftime('%Y-%m-%dT%H:%M:%SZ', 'now') WHERE id = NEW.id;
END;
-- +goose StatementEnd

-- +goose StatementBegin
CREATE TRIGGER setStageTimeModified
AFTER UPDATE ON stage
FOR EACH ROW
WHEN NEW.timeModified IS OLD.timeModified
BEGIN
    UPDATE stage SET timeModified = strftime('%Y-%m-%dT%H:%M:%SZ', 'now') WHERE id = NEW.id;
END;
-- +goose StatementEnd

-- +goose StatementBegin
CREATE TRIGGER cascadeStageUpdateToWorkflow
AFTER UPDATE ON stage
FOR EACH ROW
BEGIN
    UPDATE workflow SET timeModified = strftime('%Y-%m-%dT%H:%M:%SZ', 'now')
      WHERE id = NEW.workflow;
END;
-- +goose StatementEnd

-- +goose StatementBegin
CREATE TRIGGER setWorkflowTimeModified
AFTER UPDATE ON workflow
FOR EACH ROW
WHEN NEW.timeModified IS OLD.timeModified
BEGIN
    UPDATE workflow SET timeModified = strftime('%Y-%m-%dT%H:%M:%SZ', 'now') WHERE id = NEW.id;
END;
-- +goose StatementEnd

-- 5. Recreate the timeCompleted triggers with the canonical format.
DROP TRIGGER IF EXISTS setTaskTimeCompletedOnDoneStage_Insert;
DROP TRIGGER IF EXISTS setTaskTimeCompletedOnDoneStage_Update;

-- +goose StatementBegin
CREATE TRIGGER setTaskTimeCompletedOnDoneStage_Insert
AFTER INSERT ON task
FOR EACH ROW
WHEN NEW.timeCompleted IS NULL
   AND (SELECT type FROM stage WHERE id = NEW.stage) = 'done'
BEGIN
    UPDATE task SET timeCompleted = strftime('%Y-%m-%dT%H:%M:%SZ', 'now') WHERE id = NEW.id;
END;
-- +goose StatementEnd

-- +goose StatementBegin
CREATE TRIGGER setTaskTimeCompletedOnDoneStage_Update
AFTER UPDATE OF stage ON task
FOR EACH ROW
WHEN NEW.stage IS NOT OLD.stage
BEGIN
    UPDATE task
    SET timeCompleted = CASE
        WHEN (SELECT type FROM stage WHERE id = NEW.stage) = 'done' AND NEW.timeCompleted IS NULL
            THEN strftime('%Y-%m-%dT%H:%M:%SZ', 'now')
        WHEN (SELECT type FROM stage WHERE id = NEW.stage) != 'done'
            THEN NULL
        ELSE NEW.timeCompleted
    END
    WHERE id = NEW.id;
END;
-- +goose StatementEnd

-- 6. Fix the column DEFAULTs, which are the last remaining producer of the
--    non-canonical form: `timeCreated TIMESTAMP DEFAULT CURRENT_TIMESTAMP` on
--    workflow/stage/project/checklist/task stamps every new row as
--    '2026-08-27 02:40:25'.
--
--    SQLite cannot ALTER a column DEFAULT, and the usual table-rebuild is
--    unworkable here for the same reason documented in 00006: these tables are
--    tied together by FKs (task.stage is ON DELETE RESTRICT), and goose shares
--    a connection pool whose DSN pins foreign_keys=on, so we cannot drop and
--    recreate them. Instead edit the stored CREATE TABLE text in place via
--    writable_schema, exactly as 00006 does. A DEFAULT is only evaluated on
--    insert, so existing rows, indexes, and triggers are untouched.
--
--    The replacement is scoped to type='table' so trigger bodies -- which were
--    already rewritten above -- are not touched a second time.
PRAGMA writable_schema = ON;
UPDATE sqlite_master
   SET sql = replace(sql, 'DEFAULT CURRENT_TIMESTAMP', 'DEFAULT (strftime(''%Y-%m-%dT%H:%M:%SZ'', ''now''))')
 WHERE type = 'table'
   AND name IN ('workflow', 'stage', 'project', 'checklist', 'task');
PRAGMA writable_schema = OFF;

-- Bump the schema cookie so every other pooled connection reloads the new
-- schema; a bare writable_schema edit does not change schema_version on its
-- own. Same reasoning as 00006.
CREATE TABLE __schema_reload (x);
DROP TABLE __schema_reload;

-- +goose Down
-- One-way. The original mixed encodings cannot be reconstructed -- the point of
-- this migration is that the information distinguishing them (which write path
-- touched a row last) was never recorded. backupBeforeMigrate snapshots the DB
-- into backups/ before goose.Up runs, so that snapshot is the rollback path.
