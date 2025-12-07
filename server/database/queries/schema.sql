CREATE TABLE project (
    id INTEGER PRIMARY KEY,
    name VARCHAR
);

CREATE TABLE checklist (
    id INTEGER PRIMARY KEY,
    name VARCHAR
);

CREATE TABLE task (
    id INTEGER PRIMARY KEY,
    name VARCHAR,
    timeCompleted TIMESTAMP DEFAULT NULL,
    timePlanned TIMESTAMP DEFAULT NULL,
    assignee VARCHAR,
    priority TEXT CHECK(priority IN ('urgent','high','medium','low'))
);

CREATE TABLE projectChecklist (
    project INTEGER,
    checklist INTEGER,

    FOREIGN KEY (project) REFERENCES project(id),
    FOREIGN KEY (checklist) REFERENCES checklist(id)
);

CREATE TABLE checklistTask (
    checklist INTEGER,
    task INTEGER,

    FOREIGN KEY (checklist) REFERENCES checklist(id),
    FOREIGN KEY (task) REFERENCES task(id)
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
