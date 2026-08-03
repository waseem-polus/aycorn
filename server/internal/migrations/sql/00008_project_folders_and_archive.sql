-- +goose Up

-- +goose StatementBegin
CREATE TABLE project_folder (
    id           INTEGER PRIMARY KEY AUTOINCREMENT,
    name         TEXT    NOT NULL DEFAULT '',
    isDefault    INTEGER NOT NULL DEFAULT 0 CHECK(isDefault IN (0, 1)),
    sortOrder    INTEGER NOT NULL DEFAULT 0,
    timeCreated  TEXT    NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now')),
    timeModified TEXT    NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now'))
);
-- +goose StatementEnd

-- +goose StatementBegin
CREATE TRIGGER project_folder_timeModified
AFTER UPDATE ON project_folder
FOR EACH ROW
BEGIN
    UPDATE project_folder SET timeModified = strftime('%Y-%m-%dT%H:%M:%SZ', 'now') WHERE id = OLD.id;
END;
-- +goose StatementEnd

INSERT INTO project_folder (name, isDefault, sortOrder) VALUES ('Ungrouped', 1, 0);

-- Pin membership and pin order live here rather than on project: pinning is a
-- sidebar concern, not a property of the project. Row existence == pinned.
-- +goose StatementBegin
CREATE TABLE pinned_project (
    project   INTEGER PRIMARY KEY REFERENCES project(id) ON DELETE CASCADE,
    sortIndex INTEGER NOT NULL
);
-- +goose StatementEnd

-- Dropped first so the backfill below doesn't stamp every project as just-modified.
DROP TRIGGER IF EXISTS setProjectTimeModified;

-- Backfill from the column dropped below. id order seeds the initial pin order.
INSERT INTO pinned_project (project, sortIndex)
SELECT id, id FROM project WHERE pinned = 1;

ALTER TABLE project ADD COLUMN folder INTEGER REFERENCES project_folder(id) ON DELETE RESTRICT;

UPDATE project SET folder = (SELECT id FROM project_folder WHERE isDefault = 1);

ALTER TABLE project ADD COLUMN archived INTEGER NOT NULL DEFAULT 0 CHECK(archived IN (0, 1));

ALTER TABLE project DROP COLUMN pinned;

-- The projects list now headlines "last updated" and sorts by it, so only a
-- content change should bump timeModified. Filing into a folder or archiving is
-- bookkeeping and must not reshuffle the list. The cascade triggers
-- (cascadeTaskUpdateToParents, cascadeChecklistUpdateToProject) write
-- timeModified explicitly, so real activity still bumps it.
-- +goose StatementBegin
CREATE TRIGGER setProjectTimeModified
AFTER UPDATE ON project
FOR EACH ROW
WHEN NEW.timeModified IS OLD.timeModified
 AND (NEW.name IS NOT OLD.name OR NEW.workflow IS NOT OLD.workflow)
BEGIN
    UPDATE project SET timeModified = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;
-- +goose StatementEnd


-- +goose Down

DROP TRIGGER IF EXISTS setProjectTimeModified;

ALTER TABLE project ADD COLUMN pinned BOOLEAN;

UPDATE project SET pinned = EXISTS(SELECT 1 FROM pinned_project pp WHERE pp.project = project.id);

ALTER TABLE project DROP COLUMN archived;
ALTER TABLE project DROP COLUMN folder;

-- +goose StatementBegin
CREATE TRIGGER setProjectTimeModified
AFTER UPDATE ON project
FOR EACH ROW
WHEN NEW.timeModified IS OLD.timeModified
BEGIN
    UPDATE project SET timeModified = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;
-- +goose StatementEnd

DROP TABLE IF EXISTS pinned_project;
DROP TRIGGER IF EXISTS project_folder_timeModified;
DROP TABLE IF EXISTS project_folder;
