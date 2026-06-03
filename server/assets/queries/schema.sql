CREATE TABLE workflow (
    id INTEGER PRIMARY KEY,
    name VARCHAR NOT NULL,
    description VARCHAR,
    timeCreated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    timeModified TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TRIGGER setWorkflowTimeModified
AFTER UPDATE ON workflow
FOR EACH ROW
WHEN NEW.timeModified IS OLD.timeModified
BEGIN
    UPDATE workflow SET timeModified = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;

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

CREATE TRIGGER setStageTimeModified
AFTER UPDATE ON stage
FOR EACH ROW
WHEN NEW.timeModified IS OLD.timeModified
BEGIN
    UPDATE stage SET timeModified = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;

CREATE TRIGGER cascadeStageUpdateToWorkflow
AFTER UPDATE ON stage
FOR EACH ROW
BEGIN
    UPDATE workflow SET timeModified = CURRENT_TIMESTAMP
      WHERE id = NEW.workflow;
END;

CREATE TABLE project (
    id INTEGER PRIMARY KEY,
    name VARCHAR,
    pinned BOOLEAN,
    workflow INTEGER,
    timeCreated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    timeModified TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (workflow) REFERENCES workflow(id)
);

CREATE TRIGGER setProjectTimeModified
AFTER UPDATE ON project
FOR EACH ROW
WHEN NEW.timeModified IS OLD.timeModified
BEGIN
    UPDATE project SET timeModified = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;

CREATE TABLE checklist (
    id INTEGER PRIMARY KEY,
    project INTEGER,
    name VARCHAR,
    timeCreated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    timeModified TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    isDefault BOOLEAN,

    FOREIGN KEY (project) REFERENCES project(id)
);

CREATE TRIGGER setChecklistTimeModified
AFTER UPDATE ON checklist
FOR EACH ROW
WHEN NEW.timeModified IS OLD.timeModified
BEGIN
    UPDATE checklist SET timeModified = CURRENT_TIMESTAMP WHERE id = NEW.id;
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
    hasTimePlannedStart BOOLEAN NOT NULL DEFAULT 0,
    hasTimePlannedEnd   BOOLEAN NOT NULL DEFAULT 0,
    timeCompleted TIMESTAMP DEFAULT NULL,
    assignee VARCHAR,
    priority TEXT CHECK(priority IN ('Urgent','High','Medium','Low')),
    type TEXT CHECK(type IN ('Dev', 'Test', 'Reminder')),

    FOREIGN KEY (checklist) REFERENCES checklist(id),
    FOREIGN KEY (stage) REFERENCES stage(id) ON DELETE RESTRICT
);

CREATE TRIGGER setTaskTimeModified
AFTER UPDATE ON task
FOR EACH ROW
WHEN NEW.timeModified IS OLD.timeModified
BEGIN
    UPDATE task SET timeModified = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;

CREATE TRIGGER cascadeTaskUpdateToParents
AFTER UPDATE ON task
FOR EACH ROW
BEGIN
    UPDATE checklist SET timeModified = CURRENT_TIMESTAMP
      WHERE id = NEW.checklist;
    UPDATE project SET timeModified = CURRENT_TIMESTAMP
      WHERE id = (SELECT project FROM checklist WHERE id = NEW.checklist);
END;

CREATE TRIGGER cascadeChecklistUpdateToProject
AFTER UPDATE ON checklist
FOR EACH ROW
BEGIN
    UPDATE project SET timeModified = CURRENT_TIMESTAMP
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
    UPDATE task SET timeCompleted = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;

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

-- CREATE TABLE resource (
--     id INTEGER PRIMARY KEY,
--     name VARCHAR,
--     link VARCHAR,
--     type TEXT CHECK(type IN ('jira','documentation','spec','gitlab'))
-- );

-- CREATE TABLE taskResource (
--     task INTEGER,
--     resource INTEGER,
--     PRIMARY KEY (task, resource),
--     FOREIGN KEY (task) REFERENCES task(id),
--     FOREIGN KEY (resource) REFERENCES resource(id)
-- );

-- CREATE TABLE checklistResource (
--     checklist INTEGER,
--     resource INTEGER,
--     PRIMARY KEY (checklist, resource),
--     FOREIGN KEY (checklist) REFERENCES checklist(id),
--     FOREIGN KEY (resource) REFERENCES resource(id)
-- );
