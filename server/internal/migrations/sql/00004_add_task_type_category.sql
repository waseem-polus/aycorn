-- +goose Up

-- +goose StatementBegin
CREATE TABLE task_type_category (
    id           INTEGER PRIMARY KEY AUTOINCREMENT,
    name         TEXT    NOT NULL DEFAULT '',
    isDefault    INTEGER NOT NULL DEFAULT 0 CHECK(isDefault IN (0, 1)),
    sortOrder    INTEGER NOT NULL DEFAULT 0,
    timeCreated  TEXT    NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now')),
    timeModified TEXT    NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now'))
);
-- +goose StatementEnd

-- +goose StatementBegin
CREATE TRIGGER task_type_category_timeModified
AFTER UPDATE ON task_type_category
FOR EACH ROW
BEGIN
    UPDATE task_type_category SET timeModified = strftime('%Y-%m-%dT%H:%M:%SZ', 'now') WHERE id = OLD.id;
END;
-- +goose StatementEnd

INSERT INTO task_type_category (name, isDefault, sortOrder) VALUES ('Uncategorized', 1, 0);

ALTER TABLE task_type ADD COLUMN category INTEGER REFERENCES task_type_category(id) ON DELETE RESTRICT;

UPDATE task_type SET category = (SELECT id FROM task_type_category WHERE isDefault = 1);


-- +goose Down

ALTER TABLE task_type DROP COLUMN category;
DROP TRIGGER IF EXISTS task_type_category_timeModified;
DROP TABLE IF EXISTS task_type_category;
