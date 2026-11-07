-- +goose Up

-- (Named board_view: VIEW is an SQL keyword.)
-- A user-defined way of looking at a board's tasks (Notion-style): a name and
-- icon, a layout `type` (list / board / month / week), a grouping, and a
-- `source` — the view's own filter, stored as the client's versioned filter
-- definition JSON (the same shape as saved_filter.definition).
--
-- `type` and `groupBy` are deliberately unconstrained: the service validates
-- them, so a new layout or grouping needs no table rebuild. `groupOptions`
-- holds grouping settings such as the date granularity.
--
-- Boards mirror saved_filter_pin: the upcoming page, or one project.
CREATE TABLE board_view (
    id           INTEGER PRIMARY KEY AUTOINCREMENT,
    surface      TEXT    NOT NULL,
    project      INTEGER REFERENCES project(id) ON DELETE CASCADE,
    name         TEXT    NOT NULL,
    icon         TEXT    NOT NULL DEFAULT 'rows-3',
    color        TEXT    NOT NULL DEFAULT 'gray',
    type         TEXT    NOT NULL,
    groupBy      TEXT,
    groupOptions TEXT    NOT NULL DEFAULT '{}' CHECK (json_valid(groupOptions)),
    source       TEXT    NOT NULL CHECK (json_valid(source)),
    position     INTEGER NOT NULL,
    timeCreated  TEXT    NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now')),
    timeModified TEXT    NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now')),
    CHECK ((surface = 'project') = (project IS NOT NULL))
);

CREATE INDEX viewBoard ON board_view(surface, project, position);

-- +goose StatementBegin
CREATE TRIGGER board_view_timeModified
AFTER UPDATE ON board_view
FOR EACH ROW
WHEN NEW.timeModified = OLD.timeModified
BEGIN
    UPDATE board_view SET timeModified = strftime('%Y-%m-%dT%H:%M:%SZ', 'now') WHERE id = OLD.id;
END;
-- +goose StatementEnd

-- Every board starts with the views it had when they were hardcoded.
INSERT INTO board_view (surface, project, name, icon, type, groupBy, groupOptions, source, position)
SELECT 'project', id, 'List', 'rows-3', 'list', NULL, '{}',
       '{"version":3,"conditions":{"kind":"group","match":"all","children":[]}}', 0
FROM project;

INSERT INTO board_view (surface, project, name, icon, type, groupBy, groupOptions, source, position)
SELECT 'project', id, 'Board', 'layout-dashboard', 'board', 'stage', '{}',
       '{"version":3,"conditions":{"kind":"group","match":"all","children":[]}}', 1
FROM project;

INSERT INTO board_view (surface, project, name, icon, type, groupBy, groupOptions, source, position)
SELECT 'project', id, 'Month', 'calendar-days', 'month', 'timePlanned', '{}',
       '{"version":3,"conditions":{"kind":"group","match":"all","children":[]}}', 2
FROM project;

INSERT INTO board_view (surface, project, name, icon, type, groupBy, groupOptions, source, position)
SELECT 'project', id, 'Week', 'calendar', 'week', 'timePlanned', '{}',
       '{"version":3,"conditions":{"kind":"group","match":"all","children":[]}}', 3
FROM project;

INSERT INTO board_view (surface, project, name, icon, type, groupBy, groupOptions, source, position) VALUES
    ('upcoming', NULL, 'List', 'rows-3', 'list', 'timePlanned', '{"granularity":"week"}',
     '{"version":3,"conditions":{"kind":"group","match":"all","children":[]}}', 0),
    ('upcoming', NULL, 'Month', 'calendar-days', 'month', 'timePlanned', '{}',
     '{"version":3,"conditions":{"kind":"group","match":"all","children":[]}}', 1);

-- +goose Down

DROP TRIGGER IF EXISTS board_view_timeModified;
DROP INDEX IF EXISTS viewBoard;
DROP TABLE IF EXISTS board_view;
