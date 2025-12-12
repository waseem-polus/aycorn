package repos

import (
	"database/sql"
	"log"

	models "github.com/waseem-polus/aycorn/server/internal/models"
)

type TaskRepo struct {
	DB *sql.DB
}

func (repo *TaskRepo) InProject(projectId int) ([]models.ChecklistTask, error) {
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

	checklistTasks := []models.ChecklistTask{}

	for rows.Next() {
		ct := models.ChecklistTask{}

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

	defer rows.Close()

	return checklistTasks, nil
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

	defer rows.Close()

	return tasks, nil
}

func (repo *TaskRepo) CreateTask(newTask *models.ChecklistTask) (int64, error) {
	query := `
		INSERT INTO task (name, timePlanned, assignee, priority, type, status)
		VALUES (?, ?, ?, ?, ?, ?)
		RETURNING id;
	`
	res, err := repo.DB.Exec(query,
		newTask.Name,
		newTask.TimePlanned,
		newTask.Assignee,
		newTask.Priority,
		newTask.Type,
		newTask.Status,
	)
	if err != nil {
		return 0, err
	}

	id, err := res.LastInsertId()
	if err != nil {
		return 0, err
	}

	log.Println("Created task ", id)

	return id, nil
}

func (repo *TaskRepo) CreateChecklistTask(checklist int, task int64) (int64, error) {
	query := "INSERT INTO checklistTask (checklist, task) VALUES (?, ?);"
	res, err := repo.DB.Exec(query, checklist, task)
	if err != nil {
		return 0, err
	}

	id, err := res.LastInsertId()
	if err != nil {
		return 0, err
	}

	return id, nil
}

func (repo *TaskRepo) UpdateTask(task *models.ChecklistTask) (bool, error) {
	query := `
		UPDATE task SET
			name = ?,
			timeCreated = ?,
			timeCompleted = ?,
			timePlanned = ?,
			assignee = ?,
			priority = ?,
			type = ?,
			status = ?
		WHERE id = ?;
	`

	res, err := repo.DB.Exec(
		query,
		task.Name,
		task.TimeCreated,
		task.TimeCompleted,
		task.TimePlanned,
		task.Assignee,
		task.Priority,
		task.Type,
		task.Status,
		task.ID,
	)
	if err != nil {
		return false, err
	}

	rowsAffected, err := res.RowsAffected()
	if err != nil {
		return false, err
	}

	log.Println(task)
	log.Println("Affected ", rowsAffected, " rows")

	return rowsAffected > 0, nil
}
