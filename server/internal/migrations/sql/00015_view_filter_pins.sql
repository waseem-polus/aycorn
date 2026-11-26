-- +goose Up

-- Saved filters are pinned to views, not boards: each view offers the filters
-- that fit its purpose. Which filters are toggled on stays per board (client
-- state), so a filter pinned to several of a board's views is on or off in all
-- of them. Nothing references saved_filter_pin, so a plain rebuild is safe.
CREATE TABLE saved_filter_pin_new (
    id       INTEGER PRIMARY KEY AUTOINCREMENT,
    filter   INTEGER NOT NULL REFERENCES saved_filter(id) ON DELETE CASCADE,
    view     INTEGER NOT NULL REFERENCES board_view(id) ON DELETE CASCADE,
    position INTEGER NOT NULL,
    UNIQUE (filter, view)
);

-- A board pin becomes a pin on every view of that board, keeping its position.
INSERT INTO saved_filter_pin_new (filter, view, position)
SELECT p.filter, v.id, p.position
FROM saved_filter_pin p
JOIN board_view v ON v.surface = p.surface AND v.project IS p.project
ORDER BY v.id, p.position, p.id;

DROP INDEX IF EXISTS savedFilterPinSurface;
DROP INDEX IF EXISTS savedFilterPinProject;
DROP TABLE saved_filter_pin;
ALTER TABLE saved_filter_pin_new RENAME TO saved_filter_pin;

CREATE INDEX savedFilterPinView ON saved_filter_pin(view, position);

-- +goose Down

CREATE TABLE saved_filter_pin_old (
    id       INTEGER PRIMARY KEY AUTOINCREMENT,
    filter   INTEGER NOT NULL REFERENCES saved_filter(id) ON DELETE CASCADE,
    surface  TEXT    NOT NULL,
    project  INTEGER REFERENCES project(id) ON DELETE CASCADE,
    position INTEGER NOT NULL,
    CHECK ((surface = 'project') = (project IS NOT NULL))
);

-- One board pin per filter and board, at the filter's earliest position there.
INSERT INTO saved_filter_pin_old (filter, surface, project, position)
SELECT p.filter, v.surface, v.project, MIN(p.position)
FROM saved_filter_pin p
JOIN board_view v ON v.id = p.view
GROUP BY p.filter, v.surface, v.project;

DROP INDEX IF EXISTS savedFilterPinView;
DROP TABLE saved_filter_pin;
ALTER TABLE saved_filter_pin_old RENAME TO saved_filter_pin;

CREATE UNIQUE INDEX savedFilterPinProject ON saved_filter_pin(filter, project) WHERE project IS NOT NULL;
CREATE UNIQUE INDEX savedFilterPinSurface ON saved_filter_pin(filter, surface) WHERE project IS NULL;
