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

// boardMatch matches pins on one board. `project IS ?` is SQLite's null-safe
// equality, so the upcoming board (no project) matches too.
const boardMatch = "surface = ? AND project IS ?"

func boardArgs(board models.FilterBoard) []any {
	var project any
	if board.ProjectID != nil {
		project = *board.ProjectID
	}
	return []any{board.Surface, project}
}

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
// tool's handful of filters), so boards derive their pins from it client-side.
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

	pins, err := repo.DB.Query("SELECT filter, surface, project, position FROM saved_filter_pin ORDER BY position, id;")
	if err != nil {
		return nil, err
	}
	defer pins.Close()
	for pins.Next() {
		var filterID int
		var project sql.NullInt64
		pin := models.SavedFilterPin{}
		if err := pins.Scan(&filterID, &pin.Surface, &project, &pin.Position); err != nil {
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

// Create inserts a filter and, when pin is set, pins it to the end of that
// board in the same transaction — "save as new" from a board is one action.
func (repo *SavedFilterRepo) Create(name string, definition json.RawMessage, pin *models.FilterBoard) (int, error) {
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

	if pin != nil {
		if err := insertPinAtEnd(tx, id, *pin); err != nil {
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

// SetPins makes boards exactly the set the filter is pinned to: pins on other
// boards are removed, existing ones keep their position, new ones go last.
func (repo *SavedFilterRepo) SetPins(id int, boards []models.FilterBoard) error {
	tx, err := repo.DB.Begin()
	if err != nil {
		return err
	}
	defer tx.Rollback()

	current, err := filterBoards(tx, id)
	if err != nil {
		return err
	}
	wanted := map[boardID]bool{}
	for _, b := range boards {
		wanted[boardKey(b)] = true
	}
	for _, b := range current {
		if !wanted[boardKey(b)] {
			if _, err := tx.Exec("DELETE FROM saved_filter_pin WHERE filter = ? AND "+boardMatch+";", append([]any{id}, boardArgs(b)...)...); err != nil {
				return err
			}
		}
	}
	have := map[boardID]bool{}
	for _, b := range current {
		have[boardKey(b)] = true
	}
	for _, b := range boards {
		if have[boardKey(b)] {
			continue
		}
		if err := insertPinAtEnd(tx, id, b); err != nil {
			return err
		}
		have[boardKey(b)] = true
	}
	return tx.Commit()
}

// Pin adds a filter to the end of a board. Pinning twice is a no-op.
func (repo *SavedFilterRepo) Pin(id int, board models.FilterBoard) error {
	tx, err := repo.DB.Begin()
	if err != nil {
		return err
	}
	defer tx.Rollback()

	var exists int
	err = tx.QueryRow("SELECT COUNT(*) FROM saved_filter_pin WHERE filter = ? AND "+boardMatch+";", append([]any{id}, boardArgs(board)...)...).Scan(&exists)
	if err != nil {
		return err
	}
	if exists == 0 {
		if err := insertPinAtEnd(tx, id, board); err != nil {
			return err
		}
	}
	return tx.Commit()
}

func (repo *SavedFilterRepo) Unpin(id int, board models.FilterBoard) error {
	_, err := repo.DB.Exec("DELETE FROM saved_filter_pin WHERE filter = ? AND "+boardMatch+";", append([]any{id}, boardArgs(board)...)...)
	return err
}

// BoardFilterIDs returns the filters pinned to a board, in bar order.
func (repo *SavedFilterRepo) BoardFilterIDs(board models.FilterBoard) ([]int, error) {
	rows, err := repo.DB.Query("SELECT filter FROM saved_filter_pin WHERE "+boardMatch+" ORDER BY position, id;", boardArgs(board)...)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	ids := []int{}
	for rows.Next() {
		var id int
		if err := rows.Scan(&id); err != nil {
			return nil, err
		}
		ids = append(ids, id)
	}
	return ids, rows.Err()
}

// ReorderBoard rewrites a board's pin order atomically.
func (repo *SavedFilterRepo) ReorderBoard(board models.FilterBoard, ids []int) error {
	tx, err := repo.DB.Begin()
	if err != nil {
		return err
	}
	defer tx.Rollback()

	stmt, err := tx.Prepare("UPDATE saved_filter_pin SET position = ? WHERE filter = ? AND " + boardMatch + ";")
	if err != nil {
		return err
	}
	defer stmt.Close()
	for i, id := range ids {
		if _, err := stmt.Exec(append([]any{i, id}, boardArgs(board)...)...); err != nil {
			return err
		}
	}
	return tx.Commit()
}

func (repo *SavedFilterRepo) ProjectExists(id int) (bool, error) {
	var n int
	err := repo.DB.QueryRow("SELECT COUNT(*) FROM project WHERE id = ?;", id).Scan(&n)
	return n > 0, err
}

func insertPinAtEnd(tx *sql.Tx, filterID int, board models.FilterBoard) error {
	var next int
	if err := tx.QueryRow("SELECT COALESCE(MAX(position) + 1, 0) FROM saved_filter_pin WHERE "+boardMatch+";", boardArgs(board)...).Scan(&next); err != nil {
		return err
	}
	_, err := tx.Exec(
		"INSERT INTO saved_filter_pin (filter, surface, project, position) VALUES (?, ?, ?, ?);",
		append(append([]any{filterID}, boardArgs(board)...), next)...,
	)
	return err
}

func filterBoards(tx *sql.Tx, filterID int) ([]models.FilterBoard, error) {
	rows, err := tx.Query("SELECT surface, project FROM saved_filter_pin WHERE filter = ?;", filterID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	boards := []models.FilterBoard{}
	for rows.Next() {
		var b models.FilterBoard
		var project sql.NullInt64
		if err := rows.Scan(&b.Surface, &project); err != nil {
			return nil, err
		}
		if project.Valid {
			id := int(project.Int64)
			b.ProjectID = &id
		}
		boards = append(boards, b)
	}
	return boards, rows.Err()
}

// boardID is a comparable stand-in for a FilterBoard: a struct holding a
// *int compares by pointer, so two equal project boards would look different.
type boardID struct {
	surface string
	project int
}

func boardKey(b models.FilterBoard) boardID {
	if b.ProjectID == nil {
		return boardID{surface: b.Surface, project: -1}
	}
	return boardID{surface: b.Surface, project: *b.ProjectID}
}
