CREATE TABLE project (
    id INTEGER PRIMARY KEY,
    name VARCHAR,
    pinned BOOLEAN,
    timeCreated TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE checklist (
    id INTEGER PRIMARY KEY,
    project INTEGER,
    name VARCHAR,
    timeCreated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    isDefault BOOLEAN,

    FOREIGN KEY (project) REFERENCES project(id)
);

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
    timeCompleted TIMESTAMP DEFAULT NULL,
    timePlanned TIMESTAMP DEFAULT NULL,
    assignee VARCHAR,
    priority TEXT CHECK(priority IN ('Urgent','High','Medium','Low')),
    type TEXT CHECK(type IN ('Dev', 'Test', 'Reminder')),
    status TEXT CHECK(status IN ('Open', 'Todo', 'Doing', 'Blocked', 'Done')),

    FOREIGN KEY (checklist) REFERENCES checklist(id)
);

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
