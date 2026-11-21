-- +goose Up

-- A view's sort: an ordered JSON array of {"property", "direction"} rules,
-- applied on the client within each group / column. Like `type` and
-- `groupBy`, the properties are validated by the service (`viewSortKeys`),
-- not a CHECK, so a new sortable property needs no migration. '[]' keeps the
-- default order.
ALTER TABLE board_view ADD COLUMN sort TEXT NOT NULL DEFAULT '[]' CHECK (json_valid(sort));

-- +goose Down

ALTER TABLE board_view DROP COLUMN sort;
