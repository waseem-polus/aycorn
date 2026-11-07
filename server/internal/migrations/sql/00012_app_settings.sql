-- +goose Up

-- App-wide preferences, one row. Each setting is a real, constrained column so
-- the database rejects bad values; a new setting is a new column.
-- weekStartsOn follows date-fns: 0 = Sunday, 1 = Monday.
CREATE TABLE app_settings (
    id           INTEGER PRIMARY KEY CHECK (id = 1),
    weekStartsOn INTEGER NOT NULL DEFAULT 1 CHECK (weekStartsOn IN (0, 1))
);

INSERT INTO app_settings (id) VALUES (1);

-- +goose Down

DROP TABLE IF EXISTS app_settings;
