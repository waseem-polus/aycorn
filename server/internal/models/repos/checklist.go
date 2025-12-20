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
			c.project,
			c.timeCreated,
			c.isDefault,
			COUNT(t.id),
			SUM(CASE WHEN t.status = "Done" THEN 1 ELSE 0 END),
			CASE
		        WHEN COUNT(t.id) = 0 THEN "Open"
		        WHEN SUM(CASE WHEN t.status != "Open"    THEN 1 ELSE 0 END) = 0 THEN "Open"
		        WHEN SUM(CASE WHEN t.status != "Blocked" THEN 1 ELSE 0 END) = 0 THEN "Blocked"
		        WHEN SUM(CASE WHEN t.status != "Todo"    THEN 1 ELSE 0 END) = 0 THEN "Todo"
		        WHEN SUM(CASE WHEN t.status != "Done"    THEN 1 ELSE 0 END) = 0 THEN "Done"
		        ELSE "Doing"
			END
		FROM checklist c
			LEFT JOIN task t ON t.checklist = c.id
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

		err := rows.Scan(
			&c.ID,
			&c.Name,
			&c.Project,
			&c.TimeCreated,
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
