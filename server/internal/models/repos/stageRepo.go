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
