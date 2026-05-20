# Schema & Migrations — Agent Instructions

This directory (`server/assets/queries/`) holds the canonical `schema.sql` as a reference, but **schema.sql is no longer the source of truth for the live database**. All schema changes must go through migration files.

---

## How migrations work

The server uses [goose v3](https://github.com/pressly/goose) embedded into the binary. On every startup, `goose.Up` runs any pending migrations and then the server starts. No user action is required after a pull and rebuild.

Migration SQL files live at:

```
server/internal/migrations/sql/
  00001_initial_schema.sql   ← baseline (the original schema.sql)
  00002_your_change.sql      ← next change, and so on
```

---

## Adding a migration

1. Create a new numbered file in `server/internal/migrations/sql/`:
   ```
   00002_add_due_date_to_task.sql
   ```
2. Use the goose Up/Down annotations:
   ```sql
   -- +goose Up
   ALTER TABLE task ADD COLUMN dueDate TIMESTAMP DEFAULT NULL;

   -- +goose Down
   -- SQLite does not support DROP COLUMN before version 3.35.
   -- If targeting older SQLite, leave Down empty and document the limitation.
   ```
3. Wrap any `CREATE TRIGGER`, `CREATE INDEX`, or other multi-statement blocks with:
   ```sql
   -- +goose StatementBegin
   CREATE TRIGGER myTrigger ...
   BEGIN
       ...;
   END;
   -- +goose StatementEnd
   ```
   Plain `CREATE TABLE` and `ALTER TABLE` statements do not need these annotations.
4. **Update `schema.sql`** to reflect the new schema so it stays usable as a human reference.
5. Restart the server — goose applies the migration automatically.

---

## CHECK constraint migrations

Changing the allowed values of a hardcoded `CHECK` constraint (`task.priority`, `task.type`, `stage.type`) requires recreating the table in SQLite (no `ALTER TABLE ... MODIFY COLUMN`). The pattern:

```sql
-- +goose Up
-- Rename old table
ALTER TABLE task RENAME TO task_old;
-- Recreate with updated constraint
CREATE TABLE task ( ... priority TEXT CHECK(priority IN ('Urgent','High','Medium','Low','None')) ... );
-- Copy data
INSERT INTO task SELECT * FROM task_old;
DROP TABLE task_old;
-- Recreate triggers that reference the table
-- +goose StatementBegin
CREATE TRIGGER setTaskTimeModified ...
-- +goose StatementEnd
```

Flag this pattern whenever a feature touches those CHECK constraints (see root CLAUDE.md).

---

## What NOT to do

- **Never edit `schema.sql` to add schema changes** — the live DB is controlled by goose, not schema.sql. Editing schema.sql without a migration file means the change only applies to fresh DBs, not existing ones.
- **Never fan-out individual `ALTER TABLE` statements** across multiple migration files when one migration can cover the change atomically.
- **Never change or delete an existing migration file** — goose tracks applied versions by filename. Renaming or editing an applied file will corrupt version tracking.
