package repos

import (
	"database/sql"

	models "github.com/waseem-polus/aycorn/server/internal/models"
)

type ChecklistRepo struct {
	DB *sql.DB
}

type ChecklistTask struct {
	models.Task
	Checklist     int
	ChecklistName string
}

func (repo *ChecklistRepo) InProject(projectId int) ([]ChecklistTask, error) {
	query := `
		SELECT
			c.id,
			c.name,
			t.id,
		    t.name,
			t.timeCreated,
		    t.timeCompleted,
		    t.timePlanned,
		    t.assignee,
		    t.priority,
			t.type,
			t.status
		FROM projectChecklist pc
			INNER JOIN checklist c ON pc.checklist = c.id
			INNER JOIN checklistTask ct ON ct.checklist = c.id
			INNER JOIN task t ON t.id = ct.task
		WHERE pc.project = ? ORDER BY c.id;
	`
	rows, err := repo.DB.Query(query, projectId)
	if err != nil {
		return nil, err

	}

	checklistTasks := []ChecklistTask{}

	for rows.Next() {
		ct := ChecklistTask{}

		err := rows.Scan(
			&ct.Checklist,
			&ct.ChecklistName,
			&ct.ID,
			&ct.Name,
			&ct.TimeCreated,
			&ct.TimeCompleted,
			&ct.TimePlanned,
			&ct.Assignee,
			&ct.Priority,
			&ct.Type,
			&ct.Status,
		)
		if err != nil {
			return nil, err
		}

		checklistTasks = append(checklistTasks, ct)
	}

	err = rows.Err()
	if err != nil {
		return nil, err
	}

	return checklistTasks, nil
}

func (repo *ChecklistRepo) FindOne(id int) (*models.Checklist, error) {
	query := "SELECT id, name FROM checklist WHERE id = ?;"
	rows, err := repo.DB.Query(query, id)
	if err != nil {
		return nil, err
	}

	rows.Next()

	checklist := models.Checklist{}
	err = rows.Scan(&checklist.ID, &checklist.Name)
	if err != nil {
		return nil, err
	}

	return &checklist, nil
}
