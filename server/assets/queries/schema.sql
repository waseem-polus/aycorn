CREATE TABLE workflow (
    id INTEGER PRIMARY KEY,
    name VARCHAR NOT NULL,
    description VARCHAR,
    timeCreated TIMESTAMP DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now')),
    timeModified TIMESTAMP DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now'))
);

CREATE TRIGGER setWorkflowTimeModified
AFTER UPDATE ON workflow
FOR EACH ROW
WHEN NEW.timeModified IS OLD.timeModified
BEGIN
    UPDATE workflow SET timeModified = strftime('%Y-%m-%dT%H:%M:%SZ', 'now') WHERE id = NEW.id;
END;

CREATE TABLE stage (
    id INTEGER PRIMARY KEY,
    workflow INTEGER NOT NULL,
    name VARCHAR NOT NULL,
    description VARCHAR,
    color VARCHAR NOT NULL,
    icon VARCHAR NOT NULL,
    position INTEGER NOT NULL,
    type TEXT NOT NULL CHECK(type IN ('open', 'todo', 'doing', 'done')),
    timeCreated TIMESTAMP DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now')),
    timeModified TIMESTAMP DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now')),

    FOREIGN KEY (workflow) REFERENCES workflow(id) ON DELETE CASCADE
);

CREATE UNIQUE INDEX oneOpenStagePerWorkflow ON stage(workflow) WHERE type = 'open';

CREATE TRIGGER setStageTimeModified
AFTER UPDATE ON stage
FOR EACH ROW
WHEN NEW.timeModified IS OLD.timeModified
BEGIN
    UPDATE stage SET timeModified = strftime('%Y-%m-%dT%H:%M:%SZ', 'now') WHERE id = NEW.id;
END;

CREATE TRIGGER cascadeStageUpdateToWorkflow
AFTER UPDATE ON stage
FOR EACH ROW
BEGIN
    UPDATE workflow SET timeModified = strftime('%Y-%m-%dT%H:%M:%SZ', 'now')
      WHERE id = NEW.workflow;
END;

-- Added in migration 00008: folders for grouping projects on the projects page.
CREATE TABLE project_folder (
    id           INTEGER PRIMARY KEY AUTOINCREMENT,
    name         TEXT    NOT NULL DEFAULT '',
    isDefault    INTEGER NOT NULL DEFAULT 0 CHECK(isDefault IN (0, 1)),
    sortOrder    INTEGER NOT NULL DEFAULT 0,
    timeCreated  TEXT    NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now')),
    timeModified TEXT    NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now'))
);

CREATE TRIGGER project_folder_timeModified
AFTER UPDATE ON project_folder
FOR EACH ROW
BEGIN
    UPDATE project_folder SET timeModified = strftime('%Y-%m-%dT%H:%M:%SZ', 'now') WHERE id = OLD.id;
END;

CREATE TABLE project (
    id INTEGER PRIMARY KEY,
    name VARCHAR,
    workflow INTEGER,
    timeCreated TIMESTAMP DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now')),
    timeModified TIMESTAMP DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now')),
    -- Added in migration 00008.
    folder INTEGER REFERENCES project_folder(id) ON DELETE RESTRICT,
    archived INTEGER NOT NULL DEFAULT 0 CHECK(archived IN (0, 1)),

    FOREIGN KEY (workflow) REFERENCES workflow(id)
);

-- Added in migration 00008: pin membership *and* pin order. Row existence ==
-- pinned; there is no `pinned` column on project. Pin order drives the sidebar.
CREATE TABLE pinned_project (
    project   INTEGER PRIMARY KEY REFERENCES project(id) ON DELETE CASCADE,
    sortIndex INTEGER NOT NULL
);

-- Narrowed in migration 00008: only a content change bumps timeModified, so
-- filing into a folder or archiving doesn't reshuffle the "last updated" sort.
CREATE TRIGGER setProjectTimeModified
AFTER UPDATE ON project
FOR EACH ROW
WHEN NEW.timeModified IS OLD.timeModified
 AND (NEW.name IS NOT OLD.name OR NEW.workflow IS NOT OLD.workflow)
BEGIN
    UPDATE project SET timeModified = strftime('%Y-%m-%dT%H:%M:%SZ', 'now') WHERE id = NEW.id;
END;

CREATE TABLE checklist (
    id INTEGER PRIMARY KEY,
    project INTEGER,
    name VARCHAR,
    description VARCHAR DEFAULT '',
    timeCreated TIMESTAMP DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now')),
    timeModified TIMESTAMP DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now')),
    isDefault BOOLEAN,

    FOREIGN KEY (project) REFERENCES project(id)
);

CREATE TRIGGER setChecklistTimeModified
AFTER UPDATE ON checklist
FOR EACH ROW
WHEN NEW.timeModified IS OLD.timeModified
BEGIN
    UPDATE checklist SET timeModified = strftime('%Y-%m-%dT%H:%M:%SZ', 'now') WHERE id = NEW.id;
END;

CREATE TRIGGER oneDefaultChecklistPerProject_Update
AFTER UPDATE OF isDefault ON checklist
WHEN NEW.isDefault = True
BEGIN
    UPDATE checklist
    SET isDefault = 0
    WHERE project = NEW.project
      AND id != NEW.id
      AND isDefault = 1;
END;

CREATE TRIGGER oneDefaultChecklistPerProject_Insert
AFTER INSERT ON checklist
WHEN NEW.isDefault = 1
BEGIN
    UPDATE checklist
    SET isDefault = 0
    WHERE project = NEW.project
      AND id != NEW.id
      AND isDefault = 1;
END;

-- Added in migration 00003: task types as a first-class table.
CREATE TABLE task_type_category (
    id           INTEGER PRIMARY KEY AUTOINCREMENT,
    name         TEXT    NOT NULL DEFAULT '',
    isDefault    INTEGER NOT NULL DEFAULT 0 CHECK(isDefault IN (0, 1)),
    sortOrder    INTEGER NOT NULL DEFAULT 0,
    timeCreated  TEXT    NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now')),
    timeModified TEXT    NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now'))
);

CREATE TRIGGER task_type_category_timeModified
AFTER UPDATE ON task_type_category
FOR EACH ROW
BEGIN
    UPDATE task_type_category SET timeModified = strftime('%Y-%m-%dT%H:%M:%SZ', 'now') WHERE id = OLD.id;
END;

CREATE TABLE task_type (
    id           INTEGER PRIMARY KEY AUTOINCREMENT,
    name         TEXT    NOT NULL,
    description  TEXT    NOT NULL DEFAULT '',
    icon         TEXT    NOT NULL DEFAULT 'square-check',
    color        TEXT    NOT NULL DEFAULT 'gray',
    isDefault    INTEGER NOT NULL DEFAULT 0 CHECK(isDefault IN (0, 1)),
    category     INTEGER REFERENCES task_type_category(id) ON DELETE RESTRICT,
    timeCreated  TEXT    NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now')),
    timeModified TEXT    NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now'))
);

CREATE TRIGGER task_type_timeModified
AFTER UPDATE ON task_type
FOR EACH ROW
BEGIN
    UPDATE task_type SET timeModified = strftime('%Y-%m-%dT%H:%M:%SZ', 'now') WHERE id = OLD.id;
END;

CREATE TABLE project_task_type (
    project   INTEGER NOT NULL REFERENCES project(id) ON DELETE CASCADE,
    task_type INTEGER NOT NULL REFERENCES task_type(id) ON DELETE CASCADE,
    PRIMARY KEY (project, task_type)
);

CREATE TABLE task (
    id                  INTEGER PRIMARY KEY,
    checklist           INTEGER,
    stage               INTEGER NOT NULL,
    type                INTEGER NOT NULL REFERENCES task_type(id),
    name                VARCHAR DEFAULT '',
    body                TEXT    DEFAULT '[]',
    timeCreated         TIMESTAMP DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now')),
    timeModified        TIMESTAMP DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now')),
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

CREATE TRIGGER setTaskTimeModified
AFTER UPDATE ON task
FOR EACH ROW
WHEN NEW.timeModified IS OLD.timeModified
BEGIN
    UPDATE task SET timeModified = strftime('%Y-%m-%dT%H:%M:%SZ', 'now') WHERE id = NEW.id;
END;

CREATE TRIGGER cascadeTaskUpdateToParents
AFTER UPDATE ON task
FOR EACH ROW
BEGIN
    UPDATE checklist SET timeModified = strftime('%Y-%m-%dT%H:%M:%SZ', 'now')
      WHERE id = NEW.checklist;
    UPDATE project SET timeModified = strftime('%Y-%m-%dT%H:%M:%SZ', 'now')
      WHERE id = (SELECT project FROM checklist WHERE id = NEW.checklist);
END;

CREATE TRIGGER cascadeChecklistUpdateToProject
AFTER UPDATE ON checklist
FOR EACH ROW
BEGIN
    UPDATE project SET timeModified = strftime('%Y-%m-%dT%H:%M:%SZ', 'now')
      WHERE id = NEW.project;
END;

CREATE TRIGGER checkTimePlannedEnd_Insert
BEFORE INSERT ON task
WHEN NEW.timePlannedEnd IS NOT NULL
   AND (NEW.timePlannedStart IS NULL OR NEW.timePlannedEnd < NEW.timePlannedStart)
BEGIN
    SELECT RAISE(ABORT, 'timePlannedEnd cannot be set without timePlannedStart, and must be on or after it');
END;

CREATE TRIGGER checkTimePlannedEnd_Update
BEFORE UPDATE ON task
WHEN NEW.timePlannedEnd IS NOT NULL
   AND (NEW.timePlannedStart IS NULL OR NEW.timePlannedEnd < NEW.timePlannedStart)
BEGIN
    SELECT RAISE(ABORT, 'timePlannedEnd cannot be set without timePlannedStart, and must be on or after it');
END;

CREATE TRIGGER setTaskTimeCompletedOnDoneStage_Insert
AFTER INSERT ON task
FOR EACH ROW
WHEN NEW.timeCompleted IS NULL
   AND (SELECT type FROM stage WHERE id = NEW.stage) = 'done'
BEGIN
    UPDATE task SET timeCompleted = strftime('%Y-%m-%dT%H:%M:%SZ', 'now') WHERE id = NEW.id;
END;

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

CREATE TRIGGER task_relationship_type_timeModified
AFTER UPDATE ON task_relationship_type
FOR EACH ROW
BEGIN
    UPDATE task_relationship_type SET timeModified = strftime('%Y-%m-%dT%H:%M:%SZ', 'now') WHERE id = OLD.id;
END;

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

CREATE TRIGGER task_relationship_timeModified
AFTER UPDATE ON task_relationship
FOR EACH ROW
BEGIN
    UPDATE task_relationship SET timeModified = strftime('%Y-%m-%dT%H:%M:%SZ', 'now') WHERE id = OLD.id;
END;
