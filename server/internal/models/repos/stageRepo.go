package repos

import (
	"database/sql"

	models "github.com/waseem-polus/aycorn/server/internal/models"
)

type StageRepo struct {
	DB *sql.DB
}

const stageColumns = "id, workflow, name, COALESCE(description, ''), color, icon, position, type, timeCreated, timeModified"

func scanStage(scanner interface {
	Scan(...any) error
}, s *models.Stage) error {
	return scanner.Scan(
		&s.ID,
		&s.Workflow,
		&s.Name,
		&s.Description,
		&s.Color,
		&s.Icon,
		&s.Position,
		&s.Type,
		&s.TimeCreated,
		&s.TimeModified,
	)
}

func (repo *StageRepo) ByWorkflow(workflowId int, limit int) ([]models.Stage, error) {
	query := "SELECT " + stageColumns + " FROM stage WHERE workflow = ? ORDER BY position"
	args := []any{workflowId}
	if limit > 0 {
		query += " LIMIT ?"
		args = append(args, limit)
	}
	query += ";"

	rows, err := repo.DB.Query(query, args...)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	stages := []models.Stage{}
	for rows.Next() {
		s := models.Stage{}
		if err := scanStage(rows, &s); err != nil {
			return nil, err
		}
		stages = append(stages, s)
	}

	return stages, rows.Err()
}

func (repo *StageRepo) FindOne(id int) (*models.Stage, error) {
	query := "SELECT " + stageColumns + " FROM stage WHERE id = ?;"
	row := repo.DB.QueryRow(query, id)

	s := models.Stage{}
	if err := scanStage(row, &s); err != nil {
		return nil, err
	}

	return &s, nil
}

func (repo *StageRepo) FirstByType(workflowId int, stageType string) (*models.Stage, error) {
	query := "SELECT " + stageColumns + " FROM stage WHERE workflow = ? AND type = ? ORDER BY position LIMIT 1;"
	row := repo.DB.QueryRow(query, workflowId, stageType)

	s := models.Stage{}
	if err := scanStage(row, &s); err != nil {
		return nil, err
	}

	return &s, nil
}

func (repo *StageRepo) Create(stage *models.Stage) (int64, error) {
	query := `
		INSERT INTO stage (workflow, name, description, color, icon, position, type)
		VALUES (?, ?, ?, ?, ?, ?, ?);
	`
	res, err := repo.DB.Exec(
		query,
		stage.Workflow,
		stage.Name,
		stage.Description,
		stage.Color,
		stage.Icon,
		stage.Position,
		stage.Type,
	)
	if err != nil {
		return 0, err
	}

	return res.LastInsertId()
}

func (repo *StageRepo) Update(stage *models.Stage) (bool, error) {
	query := `
		UPDATE stage
		SET name = ?, description = ?, color = ?, icon = ?, position = ?, type = ?
		WHERE id = ?;
	`
	res, err := repo.DB.Exec(
		query,
		stage.Name,
		stage.Description,
		stage.Color,
		stage.Icon,
		stage.Position,
		stage.Type,
		stage.ID,
	)
	if err != nil {
		return false, err
	}

	affected, err := res.RowsAffected()
	if err != nil {
		return false, err
	}

	return affected > 0, nil
}

func (repo *StageRepo) Delete(id int) (bool, error) {
	query := "DELETE FROM stage WHERE id = ?;"
	res, err := repo.DB.Exec(query, id)
	if err != nil {
		return false, err
	}

	affected, err := res.RowsAffected()
	if err != nil {
		return false, err
	}

	return affected > 0, nil
}

func (repo *StageRepo) MaxPosition(workflowId int) (int, error) {
	query := "SELECT COALESCE(MAX(position), 0) FROM stage WHERE workflow = ?;"
	var max int
	if err := repo.DB.QueryRow(query, workflowId).Scan(&max); err != nil {
		return 0, err
	}
	return max, nil
}

func (repo *StageRepo) UpdateTypeMany(ids []int, stageType string) (int, error) {
	if len(ids) == 0 {
		return 0, nil
	}
	placeholders, args := intIdPlaceholders(ids)
	query := "UPDATE stage SET type = ? WHERE id IN (" + placeholders + ") AND type <> 'open';"
	args = append([]any{stageType}, args...)

	res, err := repo.DB.Exec(query, args...)
	if err != nil {
		return 0, err
	}
	affected, err := res.RowsAffected()
	if err != nil {
		return 0, err
	}
	return int(affected), nil
}

func (repo *StageRepo) UpdateColorMany(ids []int, color string) (int, error) {
	if len(ids) == 0 {
		return 0, nil
	}
	placeholders, args := intIdPlaceholders(ids)
	query := "UPDATE stage SET color = ? WHERE id IN (" + placeholders + ");"
	args = append([]any{color}, args...)

	res, err := repo.DB.Exec(query, args...)
	if err != nil {
		return 0, err
	}
	affected, err := res.RowsAffected()
	if err != nil {
		return 0, err
	}
	return int(affected), nil
}

func (repo *StageRepo) UpdateIconMany(ids []int, icon string) (int, error) {
	if len(ids) == 0 {
		return 0, nil
	}
	placeholders, args := intIdPlaceholders(ids)
	query := "UPDATE stage SET icon = ? WHERE id IN (" + placeholders + ");"
	args = append([]any{icon}, args...)

	res, err := repo.DB.Exec(query, args...)
	if err != nil {
		return 0, err
	}
	affected, err := res.RowsAffected()
	if err != nil {
		return 0, err
	}
	return int(affected), nil
}

func (repo *StageRepo) BulkMove(workflowId int, ids []int, afterId *int) (int, error) {
	if len(ids) == 0 {
		return 0, nil
	}

	tx, err := repo.DB.Begin()
	if err != nil {
		return 0, err
	}
	defer tx.Rollback()

	rows, err := tx.Query("SELECT id FROM stage WHERE workflow = ? ORDER BY position;", workflowId)
	if err != nil {
		return 0, err
	}
	current := []int{}
	for rows.Next() {
		var id int
		if err := rows.Scan(&id); err != nil {
			rows.Close()
			return 0, err
		}
		current = append(current, id)
	}
	rows.Close()
	if err := rows.Err(); err != nil {
		return 0, err
	}

	selected := make(map[int]struct{}, len(ids))
	for _, id := range ids {
		selected[id] = struct{}{}
	}

	block := []int{}
	remaining := []int{}
	for _, id := range current {
		if _, ok := selected[id]; ok {
			block = append(block, id)
		} else {
			remaining = append(remaining, id)
		}
	}

	insertIdx := 0
	if afterId != nil {
		anchor := -1
		for i, id := range current {
			if id == *afterId {
				anchor = i
				break
			}
		}
		if anchor == -1 {
			insertIdx = 0
		} else {
			anchorId := *afterId
			if _, isSelected := selected[anchorId]; isSelected {
				for i := anchor - 1; i >= 0; i-- {
					if _, sel := selected[current[i]]; !sel {
						anchorId = current[i]
						break
					}
				}
				if _, stillSelected := selected[anchorId]; stillSelected {
					insertIdx = 0
				} else {
					for i, id := range remaining {
						if id == anchorId {
							insertIdx = i + 1
							break
						}
					}
				}
			} else {
				for i, id := range remaining {
					if id == anchorId {
						insertIdx = i + 1
						break
					}
				}
			}
		}
	}

	final := make([]int, 0, len(current))
	final = append(final, remaining[:insertIdx]...)
	final = append(final, block...)
	final = append(final, remaining[insertIdx:]...)

	stmt, err := tx.Prepare("UPDATE stage SET position = ? WHERE id = ? AND workflow = ?;")
	if err != nil {
		return 0, err
	}
	defer stmt.Close()

	for i, id := range final {
		if _, err := stmt.Exec(i+1, id, workflowId); err != nil {
			return 0, err
		}
	}

	if err := tx.Commit(); err != nil {
		return 0, err
	}

	return len(block), nil
}

func (repo *StageRepo) Reorder(workflowId int, orderedStageIds []int) error {
	tx, err := repo.DB.Begin()
	if err != nil {
		return err
	}
	defer tx.Rollback()

	stmt, err := tx.Prepare("UPDATE stage SET position = ? WHERE id = ? AND workflow = ?;")
	if err != nil {
		return err
	}
	defer stmt.Close()

	for i, stageId := range orderedStageIds {
		if _, err := stmt.Exec(i+1, stageId, workflowId); err != nil {
			return err
		}
	}

	return tx.Commit()
}
