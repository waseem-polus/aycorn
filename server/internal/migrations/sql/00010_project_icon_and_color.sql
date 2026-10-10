-- +goose Up

-- Mirrors task_type.icon/color: NOT NULL with a literal default and no CHECK.
-- The color palette is deliberately migration-free (see stagecolor.go).
--
-- setProjectTimeModified is left alone on purpose. Its WHEN clause only fires
-- on name/workflow changes, so recoloring a project does not bump timeModified
-- and does not reshuffle the last-updated-sorted projects page.
ALTER TABLE project ADD COLUMN icon  TEXT NOT NULL DEFAULT 'folder';
ALTER TABLE project ADD COLUMN color TEXT NOT NULL DEFAULT 'gray';


-- +goose Down

ALTER TABLE project DROP COLUMN color;
ALTER TABLE project DROP COLUMN icon;
