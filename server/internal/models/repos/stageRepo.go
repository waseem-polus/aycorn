package repos

import (
	"database/sql"

	models "github.com/waseem-polus/aycorn/server/internal/models"
)

type StageRepo struct {
	DB *sql.DB
}

const stageColumns = "s.id, s.workflow, s.name, COALESCE(s.description, ''), s.color, s.icon, s.position, s.type, COUNT(t.id), s.timeCreated, s.timeModified"

const stageFromJoin = "FROM stage s LEFT JOIN task t ON t.stage = s.id"

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
		&s.TaskCount,
		&s.TimeCreated,
		&s.TimeModified,
	)
}

func (repo *StageRepo) ByWorkflow(workflowId int, limit int) ([]models.Stage, error) {
	query := "SELECT " + stageColumns + " " + stageFromJoin + " WHERE s.workflow = ? GROUP BY s.id ORDER BY s.position"
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

// ByWorkflowForProject returns the workflow's stages with TaskCount scoped to a
// single project's tasks (a workflow can be shared by multiple projects).
func (repo *StageRepo) ByWorkflowForProject(workflowId int, projectId int) ([]models.Stage, error) {
	query := "SELECT " + stageColumns +
		" FROM stage s LEFT JOIN task t ON t.stage = s.id" +
		" AND t.checklist IN (SELECT id FROM checklist WHERE project = ?)" +
		" WHERE s.workflow = ? GROUP BY s.id ORDER BY s.position;"

	rows, err := repo.DB.Query(query, projectId, workflowId)
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
	query := "SELECT " + stageColumns + " " + stageFromJoin + " WHERE s.id = ? GROUP BY s.id;"
	row := repo.DB.QueryRow(query, id)

	s := models.Stage{}
	if err := scanStage(row, &s); err != nil {
		return nil, err
	}

	return &s, nil
}

func (repo *StageRepo) FirstByType(workflowId int, stageType string) (*models.Stage, error) {
	query := "SELECT " + stageColumns + " " + stageFromJoin + " WHERE s.workflow = ? AND s.type = ? GROUP BY s.id ORDER BY s.position LIMIT 1;"
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

func (repo *StageRepo) FindManyByIds(ids []int) ([]models.Stage, error) {
	if len(ids) == 0 {
		return nil, nil
	}
	placeholders, args := intIdPlaceholders(ids)
	query := "SELECT " + stageColumns + " " + stageFromJoin + " WHERE s.id IN (" + placeholders + ") GROUP BY s.id;"
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

func moveTasksBulkInTx(tx interface {
	Prepare(string) (*sql.Stmt, error)
}, mappings map[int]int) error {
	stmt, err := tx.Prepare("UPDATE task SET stage = ? WHERE stage = ?;")
	if err != nil {
		return err
	}
	defer stmt.Close()

	for fromId, toId := range mappings {
		if _, err := stmt.Exec(toId, fromId); err != nil {
			return err
		}
	}
	return nil
}

func (repo *StageRepo) DeleteManyWithTaskMove(ids []int, mappings map[int]int) (int, error) {
	if len(ids) == 0 {
		return 0, nil
	}
	tx, err := repo.DB.Begin()
	if err != nil {
		return 0, err
	}
	defer tx.Rollback()

	if err := moveTasksBulkInTx(tx, mappings); err != nil {
		return 0, err
	}

	placeholders, args := intIdPlaceholders(ids)
	query := "DELETE FROM stage WHERE id IN (" + placeholders + ") AND type <> 'open';"
	res, err := tx.Exec(query, args...)
	if err != nil {
		return 0, err
	}
	affected, err := res.RowsAffected()
	if err != nil {
		return 0, err
	}

	if err := tx.Commit(); err != nil {
		return 0, err
	}
	return int(affected), nil
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

func (repo *StageRepo) BulkMove(workflowId int, ids []int, beforeId *int) (int, error) {
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

	// Compute insertion index in `remaining`. Block lands BEFORE the anchor.
	// - beforeId == nil → append to end
	// - beforeId == X (not selected) → insert before X
	// - beforeId == X (selected) → walk DOWNWARD through contiguous selected to find next non-selected anchor; insert before it. If none, append to end.
	insertIdx := len(remaining)
	if beforeId != nil {
		anchorPos := -1
		for i, id := range current {
			if id == *beforeId {
				anchorPos = i
				break
			}
		}
		if anchorPos != -1 {
			anchorId := *beforeId
			if _, isSelected := selected[anchorId]; isSelected {
				anchorId = 0
				for i := anchorPos + 1; i < len(current); i++ {
					if _, sel := selected[current[i]]; !sel {
						anchorId = current[i]
						break
					}
				}
			}
			if anchorId != 0 {
				for i, id := range remaining {
					if id == anchorId {
						insertIdx = i
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
