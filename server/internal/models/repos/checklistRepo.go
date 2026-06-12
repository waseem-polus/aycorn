package repos

import (
	"database/sql"

	models "github.com/waseem-polus/aycorn/server/internal/models"
)

type ChecklistRepo struct {
	DB *sql.DB
}

func (repo *ChecklistRepo) InProject(projectId int) ([]models.ChecklistDetails, error) {
	query := `
		SELECT c.id,
			c.name,
			COALESCE(c.description, ''),
			c.project,
			c.timeCreated,
			c.timeModified,
			c.isDefault,
			COUNT(t.id),
			SUM(CASE WHEN s.type = 'done' THEN 1 ELSE 0 END),
			CASE
		        WHEN COUNT(t.id) = 0 THEN 'unused'
		        WHEN SUM(CASE WHEN s.type != 'done' THEN 1 ELSE 0 END) = 0 THEN 'done'
		        ELSE 'doing'
			END
		FROM checklist c
			LEFT JOIN task t ON t.checklist = c.id
			LEFT JOIN stage s ON s.id = t.stage
		WHERE c.project = ?
		GROUP BY c.id
		ORDER BY c.id;
	`
	rows, err := repo.DB.Query(query, projectId)
	if err != nil {
		return nil, err

	}

	checklists := []models.ChecklistDetails{}

	for rows.Next() {
		c := models.ChecklistDetails{}
		c.StageCounts = []models.StageCount{}

		err := rows.Scan(
			&c.ID,
			&c.Name,
			&c.Description,
			&c.Project,
			&c.TimeCreated,
			&c.TimeModified,
			&c.IsDefault,
			&c.TotalCount,
			&c.DoneCount,
			&c.Status,
		)
		if err != nil {
			return nil, err
		}

		checklists = append(checklists, c)
	}

	err = rows.Err()
	if err != nil {
		return nil, err
	}

	rows.Close()

	indexByID := make(map[int]int, len(checklists))
	for i, c := range checklists {
		indexByID[c.ID] = i
	}

	countsQuery := `
		SELECT t.checklist, t.stage, COUNT(*)
		FROM task t
		WHERE t.checklist IN (SELECT id FROM checklist WHERE project = ?)
		GROUP BY t.checklist, t.stage;
	`
	countRows, err := repo.DB.Query(countsQuery, projectId)
	if err != nil {
		return nil, err
	}
	defer countRows.Close()

	for countRows.Next() {
		var checklistID int
		var sc models.StageCount

		err := countRows.Scan(&checklistID, &sc.StageID, &sc.Count)
		if err != nil {
			return nil, err
		}

		if i, ok := indexByID[checklistID]; ok {
			checklists[i].StageCounts = append(checklists[i].StageCounts, sc)
		}
	}

	err = countRows.Err()
	if err != nil {
		return nil, err
	}

	return checklists, nil
}

func (repo *ChecklistRepo) FindOne(id int64) (*models.Checklist, error) {
	query := "SELECT id, name, COALESCE(description, ''), project, timeCreated, timeModified, isDefault FROM checklist WHERE id = ?;"
	rows, err := repo.DB.Query(query, id)
	if err != nil {
		return nil, err
	}

	rows.Next()

	checklist := models.Checklist{}
	err = rows.Scan(&checklist.ID, &checklist.Name, &checklist.Description, &checklist.Project, &checklist.TimeCreated, &checklist.TimeModified, &checklist.IsDefault)
	if err != nil {
		return nil, err
	}

	defer rows.Close()

	return &checklist, nil
}

func (repo *ChecklistRepo) CreateDefaultChecklist(projectId int) error {
	query := "INSERT INTO checklist (name, project, isDefault) VALUES ('Default', ?, true);"
	_, err := repo.DB.Exec(query, projectId)
	return err
}

func (repo *ChecklistRepo) CreateChecklist(projectId int) (*models.Checklist, error) {
	query := "INSERT INTO checklist (name, project, isDefault) VALUES (?, ?, ?) RETURNING id;"
	res, err := repo.DB.Exec(query,
		"",
		projectId,
		false,
	)
	if err != nil {
		return nil, err
	}

	id, err := res.LastInsertId()
	if err != nil {
		return nil, err
	}

	checklist, err := repo.FindOne(id)
	if err != nil {
		return nil, err
	}

	return checklist, nil
}

func (repo *ChecklistRepo) UpdateChecklist(checklist *models.Checklist) (bool, error) {
	query := "UPDATE checklist SET name = ?, description = ?, isDefault = ? WHERE id = ?;"

	res, err := repo.DB.Exec(
		query,
		checklist.Name,
		checklist.Description,
		checklist.IsDefault,
		checklist.ID,
	)
	if err != nil {
		return false, err
	}

	rowsAffected, err := res.RowsAffected()
	if err != nil {
		return false, err
	}

	return rowsAffected > 0, nil
}

func (repo *ChecklistRepo) DeleteChecklist(checklistId int) (bool, error) {
	query := "DELETE FROM checklist WHERE id = ?;"

	res, err := repo.DB.Exec(query, checklistId)
	if err != nil {
		return false, err
	}

	rowsAffected, err := res.RowsAffected()
	if err != nil {
		return false, err
	}

	return rowsAffected > 0, nil
}

func (repo *ChecklistRepo) DeleteChecklistsInProject(projectId int) (bool, error) {
	query := "DELETE FROM checklist WHERE project = ?;"

	res, err := repo.DB.Exec(query, projectId)
	if err != nil {
		return false, err
	}

	rowsAffected, err := res.RowsAffected()
	if err != nil {
		return false, err
	}

	return rowsAffected > 0, nil
}
