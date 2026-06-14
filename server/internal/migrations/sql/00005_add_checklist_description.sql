-- +goose Up
ALTER TABLE checklist ADD COLUMN description VARCHAR DEFAULT '';

-- +goose Down
ALTER TABLE checklist DROP COLUMN description;
