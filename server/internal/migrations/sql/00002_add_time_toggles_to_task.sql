-- +goose Up
ALTER TABLE task ADD COLUMN hasTimePlannedStart BOOLEAN NOT NULL DEFAULT 0;
ALTER TABLE task ADD COLUMN hasTimePlannedEnd   BOOLEAN NOT NULL DEFAULT 0;

UPDATE task SET hasTimePlannedStart = 1
WHERE timePlannedStart IS NOT NULL
  AND strftime('%H:%M', timePlannedStart) != '00:00';

UPDATE task SET hasTimePlannedEnd = 1
WHERE timePlannedEnd IS NOT NULL
  AND strftime('%H:%M', timePlannedEnd) != '00:00';

-- +goose Down
ALTER TABLE task DROP COLUMN hasTimePlannedStart;
ALTER TABLE task DROP COLUMN hasTimePlannedEnd;
