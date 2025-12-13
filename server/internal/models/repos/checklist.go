package repos

import (
	"database/sql"

	models "github.com/waseem-polus/aycorn/server/internal/models"
)

type ChecklistRepo struct {
	DB *sql.DB
}

func (repo *ChecklistRepo) InProject(projectId int) ([]models.Checklist, error) {
	query := `
		SELECT c.id, c.name, c.project, c.timeCreated
		FROM checklist c
		WHERE c.project = ? ORDER BY c.id;
	`
	rows, err := repo.DB.Query(query, projectId)
	if err != nil {
		return nil, err

	}

	checklists := []models.Checklist{}

	for rows.Next() {
		c := models.Checklist{}

		err := rows.Scan(
			&c.ID,
			&c.Name,
			&c.Project,
			&c.TimeCreated,
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

	defer rows.Close()

	return checklists, nil
}

func (repo *ChecklistRepo) FindOne(id int) (*models.Checklist, error) {
	query := "SELECT id, name, project, timeCreated FROM checklist WHERE id = ?;"
	rows, err := repo.DB.Query(query, id)
	if err != nil {
		return nil, err
	}

	rows.Next()

	checklist := models.Checklist{}
	err = rows.Scan(&checklist.ID, &checklist.Name, &checklist.Project, &checklist.TimeCreated)
	if err != nil {
		return nil, err
	}

	defer rows.Close()

	return &checklist, nil
}
