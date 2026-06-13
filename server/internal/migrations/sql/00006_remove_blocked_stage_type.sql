-- +goose Up
-- Remove 'blocked' from stage.type's CHECK constraint.
--
-- SQLite can't ALTER a CHECK, and the usual table-rebuild (recreate + copy +
-- drop) is unworkable here: `stage` is referenced by task.stage's FK, so
-- dropping it trips a deferred RESTRICT violation at COMMIT — and we can't fall
-- back to `PRAGMA foreign_keys=OFF` because goose shares a connection pool whose
-- DSN pins foreign_keys=on (see cmd/web/main.go). Instead we edit the stored
-- CREATE TABLE text in place via writable_schema. A CHECK is only evaluated on
-- write, so existing rows are never re-validated and no data, index, or trigger
-- is disturbed.

-- 1. Migrate existing data off the retired type (still allowed by the old CHECK).
UPDATE stage SET type = 'todo' WHERE type = 'blocked';

-- 2. Rewrite the CHECK to drop 'blocked'.
PRAGMA writable_schema = ON;
UPDATE sqlite_master
   SET sql = replace(sql, ', ''blocked''', '')
 WHERE type = 'table' AND name = 'stage';
PRAGMA writable_schema = OFF;

-- 3. Bump the schema cookie so every other pooled connection reloads the new
--    schema. A bare writable_schema edit does not change schema_version on its
--    own, so stale connections would keep enforcing the old CHECK; a no-op
--    CREATE/DROP forces the increment.
CREATE TABLE __schema_reload (x);
DROP TABLE __schema_reload;

-- +goose Down
-- Restore 'blocked' in the CHECK. Stages already migrated to 'todo' stay 'todo'
-- (the original type is not recoverable).
PRAGMA writable_schema = ON;
UPDATE sqlite_master
   SET sql = replace(sql, '''done'')', '''done'', ''blocked'')')
 WHERE type = 'table' AND name = 'stage';
PRAGMA writable_schema = OFF;

CREATE TABLE __schema_reload (x);
DROP TABLE __schema_reload;
