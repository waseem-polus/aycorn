-- +goose Up

-- +goose StatementBegin
CREATE TABLE task_type (
    id           INTEGER PRIMARY KEY AUTOINCREMENT,
    name         TEXT    NOT NULL,
    description  TEXT    NOT NULL DEFAULT '',
    icon         TEXT    NOT NULL DEFAULT 'square-check',
    color        TEXT    NOT NULL DEFAULT 'gray',
    isDefault    INTEGER NOT NULL DEFAULT 0 CHECK(isDefault IN (0, 1)),
    timeCreated  TEXT    NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now')),
    timeModified TEXT    NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now'))
);
-- +goose StatementEnd

INSERT INTO task_type (name, description, icon, color, isDefault) VALUES
    ('Task',     'General tasks',                   'square-check', 'gray',   1),
    ('Dev',      'Development work',                'bot',          'green',  0),
    ('Test',     'Testing and quality assurance',   'bug',          'blue',   0),
    ('Reminder', 'Reminders and time-sensitive items', 'bell',      'orange', 0);

-- +goose StatementBegin
CREATE TRIGGER task_type_timeModified
AFTER UPDATE ON task_type
FOR EACH ROW
BEGIN
    UPDATE task_type SET timeModified = strftime('%Y-%m-%dT%H:%M:%SZ', 'now') WHERE id = OLD.id;
END;
-- +goose StatementEnd

-- +goose StatementBegin
CREATE TABLE project_task_type (
    project   INTEGER NOT NULL REFERENCES project(id) ON DELETE CASCADE,
    task_type INTEGER NOT NULL REFERENCES task_type(id) ON DELETE CASCADE,
    PRIMARY KEY (project, task_type)
);
-- +goose StatementEnd

-- Enable all 4 types for every existing project.
INSERT INTO project_task_type (project, task_type)
SELECT p.id, tt.id FROM project p CROSS JOIN task_type tt;

-- Rebuild task table: replace CHECK(type IN ('Dev','Test','Reminder')) with a FK to task_type.
-- After rename, triggers auto-update to fire on task_old; DROP TABLE task_old removes them.
ALTER TABLE task RENAME TO task_old;

-- +goose StatementBegin
CREATE TABLE task (
    id                  INTEGER PRIMARY KEY,
    checklist           INTEGER,
    stage               INTEGER NOT NULL,
    type                INTEGER NOT NULL REFERENCES task_type(id),
    name                VARCHAR DEFAULT '',
    body                TEXT    DEFAULT '[]',
    timeCreated         TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    timeModified        TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    timePlannedStart    TIMESTAMP DEFAULT NULL,
    timePlannedEnd      TIMESTAMP DEFAULT NULL,
    hasTimePlannedStart BOOLEAN NOT NULL DEFAULT 0,
    hasTimePlannedEnd   BOOLEAN NOT NULL DEFAULT 0,
    timeCompleted       TIMESTAMP DEFAULT NULL,
    assignee            VARCHAR,
    priority            TEXT CHECK(priority IN ('Urgent','High','Medium','Low')),
    FOREIGN KEY (checklist) REFERENCES checklist(id),
    FOREIGN KEY (stage)     REFERENCES stage(id) ON DELETE RESTRICT
);
-- +goose StatementEnd

-- Map old text type names to the new task_type IDs.
-- Tasks with an unrecognised type fall back to the isDefault type.
INSERT INTO task (id, checklist, stage, type, name, body, timeCreated, timeModified,
                  timePlannedStart, timePlannedEnd, hasTimePlannedStart, hasTimePlannedEnd,
                  timeCompleted, assignee, priority)
SELECT
    t.id,
    t.checklist,
    t.stage,
    COALESCE(
        (SELECT tt.id FROM task_type tt WHERE tt.name = t.type),
        (SELECT tt.id FROM task_type tt WHERE tt.isDefault = 1)
    ),
    t.name,
    t.body,
    t.timeCreated,
    t.timeModified,
    t.timePlannedStart,
    t.timePlannedEnd,
    t.hasTimePlannedStart,
    t.hasTimePlannedEnd,
    t.timeCompleted,
    t.assignee,
    t.priority
FROM task_old t;

DROP TABLE task_old;

-- Recreate all triggers that were on the original task table.

-- +goose StatementBegin
CREATE TRIGGER setTaskTimeModified
AFTER UPDATE ON task
FOR EACH ROW
WHEN NEW.timeModified IS OLD.timeModified
BEGIN
    UPDATE task SET timeModified = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;
-- +goose StatementEnd

-- +goose StatementBegin
CREATE TRIGGER cascadeTaskUpdateToParents
AFTER UPDATE ON task
FOR EACH ROW
BEGIN
    UPDATE checklist SET timeModified = CURRENT_TIMESTAMP
      WHERE id = NEW.checklist;
    UPDATE project SET timeModified = CURRENT_TIMESTAMP
      WHERE id = (SELECT project FROM checklist WHERE id = NEW.checklist);
END;
-- +goose StatementEnd

-- +goose StatementBegin
CREATE TRIGGER checkTimePlannedEnd_Insert
BEFORE INSERT ON task
WHEN NEW.timePlannedEnd IS NOT NULL
   AND (NEW.timePlannedStart IS NULL OR NEW.timePlannedEnd < NEW.timePlannedStart)
BEGIN
    SELECT RAISE(ABORT, 'timePlannedEnd cannot be set without timePlannedStart, and must be on or after it');
END;
-- +goose StatementEnd

-- +goose StatementBegin
CREATE TRIGGER checkTimePlannedEnd_Update
BEFORE UPDATE ON task
WHEN NEW.timePlannedEnd IS NOT NULL
   AND (NEW.timePlannedStart IS NULL OR NEW.timePlannedEnd < NEW.timePlannedStart)
BEGIN
    SELECT RAISE(ABORT, 'timePlannedEnd cannot be set without timePlannedStart, and must be on or after it');
END;
-- +goose StatementEnd

-- +goose StatementBegin
CREATE TRIGGER setTaskTimeCompletedOnDoneStage_Insert
AFTER INSERT ON task
FOR EACH ROW
WHEN NEW.timeCompleted IS NULL
   AND (SELECT type FROM stage WHERE id = NEW.stage) = 'done'
BEGIN
    UPDATE task SET timeCompleted = CURRENT_TIMESTAMP WHERE id = NEW.id;
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
            THEN CURRENT_TIMESTAMP
        WHEN (SELECT type FROM stage WHERE id = NEW.stage) != 'done'
            THEN NULL
        ELSE NEW.timeCompleted
    END
    WHERE id = NEW.id;
END;
-- +goose StatementEnd


-- +goose Down

ALTER TABLE task RENAME TO task_old;

-- +goose StatementBegin
CREATE TABLE task (
    id                  INTEGER PRIMARY KEY,
    checklist           INTEGER,
    stage               INTEGER NOT NULL,
    name                VARCHAR DEFAULT '',
    body                TEXT    DEFAULT '[]',
    timeCreated         TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    timeModified        TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    timePlannedStart    TIMESTAMP DEFAULT NULL,
    timePlannedEnd      TIMESTAMP DEFAULT NULL,
    hasTimePlannedStart BOOLEAN NOT NULL DEFAULT 0,
    hasTimePlannedEnd   BOOLEAN NOT NULL DEFAULT 0,
    timeCompleted       TIMESTAMP DEFAULT NULL,
    assignee            VARCHAR,
    priority            TEXT CHECK(priority IN ('Urgent','High','Medium','Low')),
    type                TEXT CHECK(type IN ('Dev', 'Test', 'Reminder')),
    FOREIGN KEY (checklist) REFERENCES checklist(id),
    FOREIGN KEY (stage)     REFERENCES stage(id) ON DELETE RESTRICT
);
-- +goose StatementEnd

-- Reverse the type mapping; types not in the original enum become NULL (allowed by original schema).
INSERT INTO task (id, checklist, stage, name, body, timeCreated, timeModified,
                  timePlannedStart, timePlannedEnd, hasTimePlannedStart, hasTimePlannedEnd,
                  timeCompleted, assignee, priority, type)
SELECT
    t.id,
    t.checklist,
    t.stage,
    t.name,
    t.body,
    t.timeCreated,
    t.timeModified,
    t.timePlannedStart,
    t.timePlannedEnd,
    t.hasTimePlannedStart,
    t.hasTimePlannedEnd,
    t.timeCompleted,
    t.assignee,
    t.priority,
    CASE WHEN tt.name IN ('Dev', 'Test', 'Reminder') THEN tt.name ELSE NULL END
FROM task_old t
LEFT JOIN task_type tt ON tt.id = t.type;

DROP TABLE task_old;

-- +goose StatementBegin
CREATE TRIGGER setTaskTimeModified
AFTER UPDATE ON task
FOR EACH ROW
WHEN NEW.timeModified IS OLD.timeModified
BEGIN
    UPDATE task SET timeModified = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;
-- +goose StatementEnd

-- +goose StatementBegin
CREATE TRIGGER cascadeTaskUpdateToParents
AFTER UPDATE ON task
FOR EACH ROW
BEGIN
    UPDATE checklist SET timeModified = CURRENT_TIMESTAMP
      WHERE id = NEW.checklist;
    UPDATE project SET timeModified = CURRENT_TIMESTAMP
      WHERE id = (SELECT project FROM checklist WHERE id = NEW.checklist);
END;
-- +goose StatementEnd

-- +goose StatementBegin
CREATE TRIGGER checkTimePlannedEnd_Insert
BEFORE INSERT ON task
WHEN NEW.timePlannedEnd IS NOT NULL
   AND (NEW.timePlannedStart IS NULL OR NEW.timePlannedEnd < NEW.timePlannedStart)
BEGIN
    SELECT RAISE(ABORT, 'timePlannedEnd cannot be set without timePlannedStart, and must be on or after it');
END;
-- +goose StatementEnd

-- +goose StatementBegin
CREATE TRIGGER checkTimePlannedEnd_Update
BEFORE UPDATE ON task
WHEN NEW.timePlannedEnd IS NOT NULL
   AND (NEW.timePlannedStart IS NULL OR NEW.timePlannedEnd < NEW.timePlannedStart)
BEGIN
    SELECT RAISE(ABORT, 'timePlannedEnd cannot be set without timePlannedStart, and must be on or after it');
END;
-- +goose StatementEnd

-- +goose StatementBegin
CREATE TRIGGER setTaskTimeCompletedOnDoneStage_Insert
AFTER INSERT ON task
FOR EACH ROW
WHEN NEW.timeCompleted IS NULL
   AND (SELECT type FROM stage WHERE id = NEW.stage) = 'done'
BEGIN
    UPDATE task SET timeCompleted = CURRENT_TIMESTAMP WHERE id = NEW.id;
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
            THEN CURRENT_TIMESTAMP
        WHEN (SELECT type FROM stage WHERE id = NEW.stage) != 'done'
            THEN NULL
        ELSE NEW.timeCompleted
    END
    WHERE id = NEW.id;
END;
-- +goose StatementEnd

DROP TRIGGER IF EXISTS task_type_timeModified;
DROP TABLE IF EXISTS project_task_type;
DROP TABLE IF EXISTS task_type;
