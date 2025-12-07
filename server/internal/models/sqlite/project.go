package sqlite

import (
	"database/sql"

	models "github.com/waseem-polus/aycorn/server/internal/models"
)

type ProjectModel struct {
	DB *sql.DB
}

func (m *ProjectModel) All() ([]models.Project, error) {
	query := "SELECT id, name FROM project ORDER BY id DESC;"
	rows, err := m.DB.Query(query)
	if err != nil {
		return nil, err
	}

	projects := []models.Project{}

	for rows.Next() {
		p := models.Project{}

		err := rows.Scan(&p.ID, &p.Name)
		if err != nil {
			return nil, err
		}

		projects = append(projects, p)
	}

	err = rows.Err()
	if err != nil {
		return nil, err
	}

	return projects, nil
}
