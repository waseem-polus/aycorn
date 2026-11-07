package repos

import (
	"database/sql"
	"encoding/json"
	"strings"

	models "github.com/waseem-polus/aycorn/server/internal/models"
)

type ViewRepo struct {
	DB *sql.DB
}

// NewView is a view to insert; it's appended to the end of its board.
type NewView struct {
	Name         string
	Icon         string
	Color        string
	Type         string
	GroupBy      *string
	GroupOptions json.RawMessage
	Source       json.RawMessage
}

// ViewPatch is a partial update: nil fields are left alone. ClearGroupBy
// sets groupBy to NULL (a nil GroupBy alone means "unchanged").
type ViewPatch struct {
	Name         *string
	Icon         *string
	Color        *string
	Type         *string
	GroupBy      *string
	ClearGroupBy bool
	GroupOptions *json.RawMessage
	Source       *json.RawMessage
}

const viewColumns = "id, surface, project, name, icon, color, type, groupBy, groupOptions, source, position, timeCreated, timeModified"

func scanView(row interface{ Scan(...any) error }) (models.View, error) {
	var v models.View
	var project sql.NullInt64
	var groupBy sql.NullString
	var groupOptions, source string
	if err := row.Scan(&v.ID, &v.Surface, &project, &v.Name, &v.Icon, &v.Color, &v.Type,
		&groupBy, &groupOptions, &source, &v.Position, &v.TimeCreated, &v.TimeModified); err != nil {
		return v, err
	}
	if project.Valid {
		id := int(project.Int64)
		v.ProjectID = &id
	}
	if groupBy.Valid {
		v.GroupBy = &groupBy.String
	}
	v.GroupOptions = json.RawMessage(groupOptions)
	v.Source = json.RawMessage(source)
	return v, nil
}

// ForBoard returns a board's views in tab order.
func (repo *ViewRepo) ForBoard(board models.FilterBoard) ([]models.View, error) {
	rows, err := repo.DB.Query("SELECT "+viewColumns+" FROM board_view WHERE "+boardMatch+" ORDER BY position, id;", boardArgs(board)...)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	views := []models.View{}
	for rows.Next() {
		v, err := scanView(rows)
		if err != nil {
			return nil, err
		}
		views = append(views, v)
	}
	return views, rows.Err()
}

func (repo *ViewRepo) FindOne(id int) (*models.View, error) {
	v, err := scanView(repo.DB.QueryRow("SELECT "+viewColumns+" FROM board_view WHERE id = ?;", id))
	if err != nil {
		return nil, err
	}
	return &v, nil
}

// CreateMany appends views to a board in one transaction, in order, and
// returns their ids.
func (repo *ViewRepo) CreateMany(board models.FilterBoard, views []NewView) ([]int, error) {
	tx, err := repo.DB.Begin()
	if err != nil {
		return nil, err
	}
	defer tx.Rollback()

	var next int
	if err := tx.QueryRow("SELECT COALESCE(MAX(position) + 1, 0) FROM board_view WHERE "+boardMatch+";", boardArgs(board)...).Scan(&next); err != nil {
		return nil, err
	}

	ids := make([]int, 0, len(views))
	for i, v := range views {
		res, err := tx.Exec(
			"INSERT INTO board_view (surface, project, name, icon, color, type, groupBy, groupOptions, source, position) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?);",
			append(boardArgs(board), v.Name, v.Icon, v.Color, v.Type, v.GroupBy, string(v.GroupOptions), string(v.Source), next+i)...,
		)
		if err != nil {
			return nil, err
		}
		id, err := res.LastInsertId()
		if err != nil {
			return nil, err
		}
		ids = append(ids, int(id))
	}
	return ids, tx.Commit()
}

// Update applies a partial patch. Returns sql.ErrNoRows for an unknown id.
func (repo *ViewRepo) Update(id int, patch ViewPatch) error {
	sets := []string{}
	args := []any{}
	add := func(column string, value any) {
		sets = append(sets, column+" = ?")
		args = append(args, value)
	}
	if patch.Name != nil {
		add("name", *patch.Name)
	}
	if patch.Icon != nil {
		add("icon", *patch.Icon)
	}
	if patch.Color != nil {
		add("color", *patch.Color)
	}
	if patch.Type != nil {
		add("type", *patch.Type)
	}
	if patch.ClearGroupBy {
		add("groupBy", nil)
	} else if patch.GroupBy != nil {
		add("groupBy", *patch.GroupBy)
	}
	if patch.GroupOptions != nil {
		add("groupOptions", string(*patch.GroupOptions))
	}
	if patch.Source != nil {
		add("source", string(*patch.Source))
	}
	if len(sets) == 0 {
		_, err := repo.FindOne(id)
		return err
	}

	args = append(args, id)
	res, err := repo.DB.Exec("UPDATE board_view SET "+strings.Join(sets, ", ")+" WHERE id = ?;", args...)
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

// Delete removes a view unless it's the last one on its board, in one
// statement so two concurrent deletes can't empty a board. Reports whether a
// row was deleted.
func (repo *ViewRepo) DeleteUnlessLast(id int) (bool, error) {
	res, err := repo.DB.Exec(`
		DELETE FROM board_view
		WHERE id = ?
		  AND (SELECT COUNT(*) FROM board_view other
		       WHERE other.surface = board_view.surface
		         AND other.project IS board_view.project) > 1;`, id)
	if err != nil {
		return false, err
	}
	affected, err := res.RowsAffected()
	return affected > 0, err
}

// BoardViewIDs returns a board's view ids in tab order.
func (repo *ViewRepo) BoardViewIDs(board models.FilterBoard) ([]int, error) {
	rows, err := repo.DB.Query("SELECT id FROM board_view WHERE "+boardMatch+" ORDER BY position, id;", boardArgs(board)...)
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

// Reorder rewrites a board's tab order atomically.
func (repo *ViewRepo) Reorder(ids []int) error {
	tx, err := repo.DB.Begin()
	if err != nil {
		return err
	}
	defer tx.Rollback()

	stmt, err := tx.Prepare("UPDATE board_view SET position = ? WHERE id = ?;")
	if err != nil {
		return err
	}
	defer stmt.Close()
	for i, id := range ids {
		if _, err := stmt.Exec(i, id); err != nil {
			return err
		}
	}
	return tx.Commit()
}
