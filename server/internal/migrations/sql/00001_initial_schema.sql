-- +goose Up

CREATE TABLE workflow (
    id INTEGER PRIMARY KEY,
    name VARCHAR NOT NULL,
    description VARCHAR,
    timeCreated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    timeModified TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- +goose StatementBegin
CREATE TRIGGER setWorkflowTimeModified
AFTER UPDATE ON workflow
FOR EACH ROW
WHEN NEW.timeModified IS OLD.timeModified
BEGIN
    UPDATE workflow SET timeModified = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;
-- +goose StatementEnd

CREATE TABLE stage (
    id INTEGER PRIMARY KEY,
    workflow INTEGER NOT NULL,
    name VARCHAR NOT NULL,
    description VARCHAR,
    color VARCHAR NOT NULL,
    icon VARCHAR NOT NULL,
    position INTEGER NOT NULL,
    type TEXT NOT NULL CHECK(type IN ('open', 'todo', 'doing', 'done', 'blocked')),
    timeCreated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    timeModified TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (workflow) REFERENCES workflow(id) ON DELETE CASCADE
);

CREATE UNIQUE INDEX oneOpenStagePerWorkflow ON stage(workflow) WHERE type = 'open';

-- +goose StatementBegin
CREATE TRIGGER setStageTimeModified
AFTER UPDATE ON stage
FOR EACH ROW
WHEN NEW.timeModified IS OLD.timeModified
BEGIN
    UPDATE stage SET timeModified = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;
-- +goose StatementEnd

-- +goose StatementBegin
CREATE TRIGGER cascadeStageUpdateToWorkflow
AFTER UPDATE ON stage
FOR EACH ROW
BEGIN
    UPDATE workflow SET timeModified = CURRENT_TIMESTAMP
      WHERE id = NEW.workflow;
END;
-- +goose StatementEnd

CREATE TABLE project (
    id INTEGER PRIMARY KEY,
    name VARCHAR,
    pinned BOOLEAN,
    workflow INTEGER,
    timeCreated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    timeModified TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (workflow) REFERENCES workflow(id)
);

-- +goose StatementBegin
CREATE TRIGGER setProjectTimeModified
AFTER UPDATE ON project
FOR EACH ROW
WHEN NEW.timeModified IS OLD.timeModified
BEGIN
    UPDATE project SET timeModified = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;
-- +goose StatementEnd

CREATE TABLE checklist (
    id INTEGER PRIMARY KEY,
    project INTEGER,
    name VARCHAR,
    timeCreated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    timeModified TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    isDefault BOOLEAN,

    FOREIGN KEY (project) REFERENCES project(id)
);

-- +goose StatementBegin
CREATE TRIGGER setChecklistTimeModified
AFTER UPDATE ON checklist
FOR EACH ROW
WHEN NEW.timeModified IS OLD.timeModified
BEGIN
    UPDATE checklist SET timeModified = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;
-- +goose StatementEnd

-- +goose StatementBegin
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
-- +goose StatementEnd

-- +goose StatementBegin
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
-- +goose StatementEnd

CREATE TABLE task (
    id INTEGER PRIMARY KEY,
    checklist INTEGER,
    stage INTEGER NOT NULL,
    name VARCHAR DEFAULT '',
    body TEXT DEFAULT '[]',
    timeCreated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    timeModified TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    timePlannedStart TIMESTAMP DEFAULT NULL,
    timePlannedEnd   TIMESTAMP DEFAULT NULL,
    timeCompleted TIMESTAMP DEFAULT NULL,
    assignee VARCHAR,
    priority TEXT CHECK(priority IN ('Urgent','High','Medium','Low')),
    type TEXT CHECK(type IN ('Dev', 'Test', 'Reminder')),

    FOREIGN KEY (checklist) REFERENCES checklist(id),
    FOREIGN KEY (stage) REFERENCES stage(id) ON DELETE RESTRICT
);

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
CREATE TRIGGER cascadeChecklistUpdateToProject
AFTER UPDATE ON checklist
FOR EACH ROW
BEGIN
    UPDATE project SET timeModified = CURRENT_TIMESTAMP
      WHERE id = NEW.project;
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

DROP TRIGGER IF EXISTS setTaskTimeCompletedOnDoneStage_Update;
DROP TRIGGER IF EXISTS setTaskTimeCompletedOnDoneStage_Insert;
DROP TRIGGER IF EXISTS checkTimePlannedEnd_Update;
DROP TRIGGER IF EXISTS checkTimePlannedEnd_Insert;
DROP TRIGGER IF EXISTS cascadeChecklistUpdateToProject;
DROP TRIGGER IF EXISTS cascadeTaskUpdateToParents;
DROP TRIGGER IF EXISTS setTaskTimeModified;
DROP TABLE IF EXISTS task;
DROP TRIGGER IF EXISTS oneDefaultChecklistPerProject_Insert;
DROP TRIGGER IF EXISTS oneDefaultChecklistPerProject_Update;
DROP TRIGGER IF EXISTS setChecklistTimeModified;
DROP TABLE IF EXISTS checklist;
DROP TRIGGER IF EXISTS setProjectTimeModified;
DROP TABLE IF EXISTS project;
DROP TRIGGER IF EXISTS cascadeStageUpdateToWorkflow;
DROP TRIGGER IF EXISTS setStageTimeModified;
DROP INDEX IF EXISTS oneOpenStagePerWorkflow;
DROP TABLE IF EXISTS stage;
DROP TRIGGER IF EXISTS setWorkflowTimeModified;
DROP TABLE IF EXISTS workflow;
