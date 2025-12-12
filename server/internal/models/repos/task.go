package repos

import (
	"database/sql"

	models "github.com/waseem-polus/aycorn/server/internal/models"
)

type TaskRepo struct {
	DB *sql.DB
}

func (repo *TaskRepo) InChecklist(checklistId int) ([]models.Task, error) {
	query := `
		SELECT
			t.id,
		    t.name,
		    t.timeCompleted,
		    t.timePlanned,
		    t.assignee
		    t.priority
		FROM checklistTask ct
			LEFT JOIN task t ON ct.task = t.id
		WHERE ct.checklist = ?
		ORDER BY t.id;
	`

	rows, err := repo.DB.Query(query, checklistId)
	if err != nil {
		return nil, err
	}

	tasks := []models.Task{}

	for rows.Next() {
		c := models.Task{}

		err := rows.Scan(&c.ID, &c.Name, &c.TimeCompleted, &c.TimePlanned, &c.Assignee, &c.Priority)
		if err != nil {
			return nil, err
		}

		tasks = append(tasks, c)
	}

	err = rows.Err()
	if err != nil {
		return nil, err
	}

	return tasks, nil
}
