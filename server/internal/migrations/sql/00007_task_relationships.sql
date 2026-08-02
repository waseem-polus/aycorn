-- +goose Up

-- +goose StatementBegin
CREATE TABLE task_relationship_type (
    id           INTEGER PRIMARY KEY AUTOINCREMENT,
    fromName     TEXT    NOT NULL,
    toName       TEXT    NOT NULL,
    behavior     TEXT    NOT NULL CHECK(behavior IN ('blocking', 'subtask', 'link')),
    icon         TEXT    NOT NULL DEFAULT 'link',
    color        TEXT    NOT NULL DEFAULT 'gray',
    isSystem     INTEGER NOT NULL DEFAULT 0 CHECK(isSystem IN (0, 1)),
    timeCreated  TEXT    NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now')),
    timeModified TEXT    NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now'))
);
-- +goose StatementEnd

-- Seed the 3 built-in system types. Icon/color mirror the previously hardcoded card.
INSERT INTO task_relationship_type (fromName, toName, behavior, icon, color, isSystem) VALUES
    ('Blocks',   'Blocked By',   'blocking', 'octagon-minus', 'red',     1),
    ('Subtask Of',   'Parent Of',      'subtask',  'list-todo',     'emerald', 1),
    ('Mentions', 'Mentioned By', 'link',     'at-sign',       'purple',  1);

-- +goose StatementBegin
CREATE TRIGGER task_relationship_type_timeModified
AFTER UPDATE ON task_relationship_type
FOR EACH ROW
BEGIN
    UPDATE task_relationship_type SET timeModified = strftime('%Y-%m-%dT%H:%M:%SZ', 'now') WHERE id = OLD.id;
END;
-- +goose StatementEnd

-- +goose StatementBegin
CREATE TABLE task_relationship (
    id               INTEGER PRIMARY KEY AUTOINCREMENT,
    fromTask         INTEGER NOT NULL REFERENCES task(id) ON DELETE CASCADE,
    toTask           INTEGER NOT NULL REFERENCES task(id) ON DELETE CASCADE,
    relationshipType INTEGER NOT NULL REFERENCES task_relationship_type(id) ON DELETE RESTRICT,
    timeCreated      TEXT    NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now')),
    timeModified     TEXT    NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now')),
    CHECK (fromTask <> toTask),
    UNIQUE (fromTask, toTask, relationshipType)
);
-- +goose StatementEnd

-- +goose StatementBegin
CREATE TRIGGER task_relationship_timeModified
AFTER UPDATE ON task_relationship
FOR EACH ROW
BEGIN
    UPDATE task_relationship SET timeModified = strftime('%Y-%m-%dT%H:%M:%SZ', 'now') WHERE id = OLD.id;
END;
-- +goose StatementEnd


-- +goose Down

DROP TRIGGER IF EXISTS task_relationship_timeModified;
DROP TABLE IF EXISTS task_relationship;
DROP TRIGGER IF EXISTS task_relationship_type_timeModified;
DROP TABLE IF EXISTS task_relationship_type;
