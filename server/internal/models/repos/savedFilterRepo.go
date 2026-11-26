package repos

import (
	"database/sql"
	"encoding/json"
	"strings"

	models "github.com/waseem-polus/aycorn/server/internal/models"
)

type SavedFilterRepo struct {
	DB *sql.DB
}

// SavedFilterPatch is a partial update: nil fields are left alone. Cosmetic
// fields join here as they're added.
type SavedFilterPatch struct {
	Name       *string
	Definition *json.RawMessage
}

const savedFilterColumns = "id, name, definition, timeCreated, timeModified"

func scanSavedFilter(row interface{ Scan(...any) error }) (models.SavedFilter, error) {
	f := models.SavedFilter{Pins: []models.SavedFilterPin{}}
	var definition string
	if err := row.Scan(&f.ID, &f.Name, &definition, &f.TimeCreated, &f.TimeModified); err != nil {
		return f, err
	}
	f.Definition = json.RawMessage(definition)
	return f, nil
}

// All returns every filter with its pins. The list is small (a personal
// tool's handful of filters), so views derive their pins from it client-side.
func (repo *SavedFilterRepo) All() ([]models.SavedFilter, error) {
	rows, err := repo.DB.Query("SELECT " + savedFilterColumns + " FROM saved_filter ORDER BY name COLLATE NOCASE, id;")
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	filters := []models.SavedFilter{}
	index := map[int]int{}
	for rows.Next() {
		f, err := scanSavedFilter(rows)
		if err != nil {
			return nil, err
		}
		index[f.ID] = len(filters)
		filters = append(filters, f)
	}
	if err := rows.Err(); err != nil {
		return nil, err
	}

	pins, err := repo.DB.Query(`
SELECT p.filter, p.view, v.name, v.surface, v.project, p.position
FROM saved_filter_pin p
JOIN board_view v ON v.id = p.view
ORDER BY v.position, v.id, p.position, p.id;`)
	if err != nil {
		return nil, err
	}
	defer pins.Close()
	for pins.Next() {
		var filterID int
		var project sql.NullInt64
		pin := models.SavedFilterPin{}
		if err := pins.Scan(&filterID, &pin.ViewID, &pin.ViewName, &pin.Surface, &project, &pin.Position); err != nil {
			return nil, err
		}
		if project.Valid {
			id := int(project.Int64)
			pin.ProjectID = &id
		}
		if i, ok := index[filterID]; ok {
			filters[i].Pins = append(filters[i].Pins, pin)
		}
	}
	return filters, pins.Err()
}

func (repo *SavedFilterRepo) FindOne(id int) (*models.SavedFilter, error) {
	f, err := scanSavedFilter(repo.DB.QueryRow("SELECT "+savedFilterColumns+" FROM saved_filter WHERE id = ?;", id))
	if err != nil {
		return nil, err
	}
	return &f, nil
}

// Create inserts a filter and, when pinView is set, pins it to the end of that
// view in the same transaction — "save as new" from a view is one action.
func (repo *SavedFilterRepo) Create(name string, definition json.RawMessage, pinView *int) (int, error) {
	tx, err := repo.DB.Begin()
	if err != nil {
		return 0, err
	}
	defer tx.Rollback()

	res, err := tx.Exec("INSERT INTO saved_filter (name, definition) VALUES (?, ?);", name, string(definition))
	if err != nil {
		return 0, err
	}
	id64, err := res.LastInsertId()
	if err != nil {
		return 0, err
	}
	id := int(id64)

	if pinView != nil {
		if err := insertPinAtEnd(tx, id, *pinView); err != nil {
			return 0, err
		}
	}
	return id, tx.Commit()
}

// Update applies a partial patch. Returns sql.ErrNoRows for an unknown id.
func (repo *SavedFilterRepo) Update(id int, patch SavedFilterPatch) error {
	sets := []string{}
	args := []any{}
	if patch.Name != nil {
		sets = append(sets, "name = ?")
		args = append(args, *patch.Name)
	}
	if patch.Definition != nil {
		sets = append(sets, "definition = ?")
		args = append(args, string(*patch.Definition))
	}
	if len(sets) == 0 {
		_, err := repo.FindOne(id)
		return err
	}

	args = append(args, id)
	res, err := repo.DB.Exec("UPDATE saved_filter SET "+strings.Join(sets, ", ")+" WHERE id = ?;", args...)
	if err != nil {
		return err
	}
	affected, err := res.RowsAffected()
	if err != nil {
		return err
	}
	if affected == 0 {
		return sql.ErrNoRows
	}
	return nil
}

// Duplicate copies a filter's name and definition. Pins aren't copied: the
// copy is a new filter to place deliberately.
func (repo *SavedFilterRepo) Duplicate(id int) (int, error) {
	res, err := repo.DB.Exec(
		"INSERT INTO saved_filter (name, definition) SELECT name || ' copy', definition FROM saved_filter WHERE id = ?;",
		id,
	)
	if err != nil {
		return 0, err
	}
	affected, err := res.RowsAffected()
	if err != nil {
		return 0, err
	}
	if affected == 0 {
		return 0, sql.ErrNoRows
	}
	newID, err := res.LastInsertId()
	return int(newID), err
}

// DeleteMany deletes filters in one statement; their pins cascade. Returns
// how many existed and were deleted.
func (repo *SavedFilterRepo) DeleteMany(ids []int) (int, error) {
	if len(ids) == 0 {
		return 0, nil
	}
	placeholders, args := intIdPlaceholders(ids)
	res, err := repo.DB.Exec("DELETE FROM saved_filter WHERE id IN ("+placeholders+");", args...)
	if err != nil {
		return 0, err
	}
	affected, err := res.RowsAffected()
	return int(affected), err
}

// Pin adds a filter to the end of a view. Pinning twice is a no-op.
func (repo *SavedFilterRepo) Pin(id int, viewID int) error {
	tx, err := repo.DB.Begin()
	if err != nil {
		return err
	}
	defer tx.Rollback()

	var exists int
	if err := tx.QueryRow("SELECT COUNT(*) FROM saved_filter_pin WHERE filter = ? AND view = ?;", id, viewID).Scan(&exists); err != nil {
		return err
	}
	if exists == 0 {
		if err := insertPinAtEnd(tx, id, viewID); err != nil {
			return err
		}
	}
	return tx.Commit()
}

func (repo *SavedFilterRepo) Unpin(id int, viewID int) error {
	_, err := repo.DB.Exec("DELETE FROM saved_filter_pin WHERE filter = ? AND view = ?;", id, viewID)
	return err
}

// SetViewFilters makes ids exactly the filters pinned to a view, in that
// order: pins not listed are removed, listed ones are added or moved. One
// transaction, so add, remove and reorder are a single atomic change.
func (repo *SavedFilterRepo) SetViewFilters(viewID int, ids []int) error {
	tx, err := repo.DB.Begin()
	if err != nil {
		return err
	}
	defer tx.Rollback()

	if len(ids) == 0 {
		if _, err := tx.Exec("DELETE FROM saved_filter_pin WHERE view = ?;", viewID); err != nil {
			return err
		}
		return tx.Commit()
	}

	placeholders, args := intIdPlaceholders(ids)
	if _, err := tx.Exec(
		"DELETE FROM saved_filter_pin WHERE view = ? AND filter NOT IN ("+placeholders+");",
		append([]any{viewID}, args...)...,
	); err != nil {
		return err
	}

	stmt, err := tx.Prepare(`
INSERT INTO saved_filter_pin (filter, view, position) VALUES (?, ?, ?)
ON CONFLICT (filter, view) DO UPDATE SET position = excluded.position;`)
	if err != nil {
		return err
	}
	defer stmt.Close()
	for i, id := range ids {
		if _, err := stmt.Exec(id, viewID, i); err != nil {
			return err
		}
	}
	return tx.Commit()
}

// CountExisting returns how many of ids are saved filters.
func (repo *SavedFilterRepo) CountExisting(ids []int) (int, error) {
	if len(ids) == 0 {
		return 0, nil
	}
	placeholders, args := intIdPlaceholders(ids)
	var n int
	err := repo.DB.QueryRow("SELECT COUNT(*) FROM saved_filter WHERE id IN ("+placeholders+");", args...).Scan(&n)
	return n, err
}

func insertPinAtEnd(tx *sql.Tx, filterID int, viewID int) error {
	var next int
	if err := tx.QueryRow("SELECT COALESCE(MAX(position) + 1, 0) FROM saved_filter_pin WHERE view = ?;", viewID).Scan(&next); err != nil {
		return err
	}
	_, err := tx.Exec("INSERT INTO saved_filter_pin (filter, view, position) VALUES (?, ?, ?);", filterID, viewID, next)
	return err
}
