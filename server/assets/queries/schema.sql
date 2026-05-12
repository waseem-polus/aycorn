CREATE TABLE project (
    id INTEGER PRIMARY KEY,
    name VARCHAR,
    pinned BOOLEAN,
    timeCreated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    timeModified TIMESTAMP DEFAULT CURRENT_TIMESTAMP
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
    status TEXT CHECK(status IN ('Open', 'Todo', 'Doing', 'Blocked', 'Done')),

    FOREIGN KEY (checklist) REFERENCES checklist(id)
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
