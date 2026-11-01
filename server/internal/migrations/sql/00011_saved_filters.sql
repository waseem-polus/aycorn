-- +goose Up

-- A named, reusable filter. `definition` is the client's versioned filter
-- definition (basic filters + condition tree) stored as JSON. Cosmetic fields
-- (color, icon, description) are meant to arrive later as nullable columns.
CREATE TABLE saved_filter (
    id           INTEGER PRIMARY KEY AUTOINCREMENT,
    name         TEXT    NOT NULL,
    definition   TEXT    NOT NULL CHECK (json_valid(definition)),
    timeCreated  TEXT    NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now')),
    timeModified TEXT    NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now'))
);

-- +goose StatementBegin
CREATE TRIGGER saved_filter_timeModified
AFTER UPDATE ON saved_filter
FOR EACH ROW
BEGIN
    UPDATE saved_filter SET timeModified = strftime('%Y-%m-%dT%H:%M:%SZ', 'now') WHERE id = OLD.id;
END;
-- +goose StatementEnd

-- Where a filter shows up as a quick filter, in board order. `surface` is left
-- unconstrained on purpose (the service validates it) so a future surface —
-- a view, a widget — needs no table rebuild. Only project boards carry a
-- project, and deleting either side drops the pin.
CREATE TABLE saved_filter_pin (
    id       INTEGER PRIMARY KEY AUTOINCREMENT,
    filter   INTEGER NOT NULL REFERENCES saved_filter(id) ON DELETE CASCADE,
    surface  TEXT    NOT NULL,
    project  INTEGER REFERENCES project(id) ON DELETE CASCADE,
    position INTEGER NOT NULL,
    CHECK ((surface = 'project') = (project IS NOT NULL))
);

CREATE UNIQUE INDEX savedFilterPinProject ON saved_filter_pin(filter, project) WHERE project IS NOT NULL;
CREATE UNIQUE INDEX savedFilterPinSurface ON saved_filter_pin(filter, surface) WHERE project IS NULL;

-- +goose Down

DROP INDEX IF EXISTS savedFilterPinSurface;
DROP INDEX IF EXISTS savedFilterPinProject;
DROP TABLE IF EXISTS saved_filter_pin;
DROP TRIGGER IF EXISTS saved_filter_timeModified;
DROP TABLE IF EXISTS saved_filter;
