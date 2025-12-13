package repos

import (
	"database/sql"

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
		FROM checklist c
			INNER JOIN task t ON t.checklist = c.id
		WHERE c.project = ? ORDER BY c.id;
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
		    t.assignee,
		    t.priority
		FROM task t
		WHERE t.checklist = ?
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

func (repo *TaskRepo) CreateTask(newTask *models.ChecklistTask) (*models.Task, error) {
	query := `
		INSERT INTO task (name, checklist, timePlanned, assignee, priority, type, status)
		VALUES (?, ?, ?, ?, ?, ?, ?)
		RETURNING id;
	`
	res, err := repo.DB.Exec(query,
		newTask.Name,
		newTask.Checklist,
		newTask.TimePlanned,
		newTask.Assignee,
		newTask.Priority,
		newTask.Type,
		newTask.Status,
	)
	if err != nil {
		return nil, err
	}

	id, err := res.LastInsertId()
	if err != nil {
		return nil, err
	}

	task, err := repo.FindOne(id)
	if err != nil {
		return nil, err
	}

	return task, nil
}

func (repo *TaskRepo) UpdateTask(task *models.ChecklistTask) (bool, error) {
	query := `
		UPDATE task SET
			name = ?,
			checklist = ?,
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
		task.Checklist,
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

	return rowsAffected > 0, nil
}

func (repo *TaskRepo) FindOne(taskId int64) (*models.Task, error) {
	query := `
		SELECT
			t.id,
			t.name,
			t.timeCreated,
			t.timeCompleted,
			t.timePlanned,
			t.assignee,
			t.priority,
			t.type,
			t.status,
			t.checklist
		FROM task t
		WHERE t.id = ?;
	`
	rows, err := repo.DB.Query(query, taskId)
	if err != nil {
		return nil, err
	}

	task := models.Task{}
	rows.Next()
	err = rows.Err()
	if err != nil {
		return nil, err
	}

	err = rows.Scan(
		&task.ID,
		&task.Name,
		&task.TimeCreated,
		&task.TimeCompleted,
		&task.TimePlanned,
		&task.Assignee,
		&task.Priority,
		&task.Type,
		&task.Status,
		&task.Checklist,
	)
	if err != nil {
		return nil, err
	}

	defer rows.Close()

	return &task, nil
}

func (repo *TaskRepo) DeleteTask(taskId int) (bool, error) {
	query := "DELETE FROM task WHERE id = ?;"

	res, err := repo.DB.Exec(query, taskId)
	if err != nil {
		return false, err
	}

	if err != nil {
		return false, err
	}

	rowsAffected, err := res.RowsAffected()
	if err != nil {
		return false, err
	}

	return rowsAffected > 0, nil
}
