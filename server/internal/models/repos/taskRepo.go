package repos

import (
	"database/sql"
	"strings"

	models "github.com/waseem-polus/aycorn/server/internal/models"
)

type TaskRepo struct {
	DB *sql.DB
}

type TaskFilters struct {
	SearchQuery    string
	ChecklistQuery []string
	TypeQuery      []string
	StatusQuery    []string
	PriorityQuery  []string
	AssigneeQuery  []string
}

func (repo *TaskRepo) InProject(projectId int, taskFilters *TaskFilters) ([]models.ChecklistTask, error) {
	query := `
		SELECT
			c.id,
			c.name,
			t.id,
		    t.name,
			t.timeCreated,
		    t.timePlannedStart,
		    t.timePlannedEnd,
		    t.timeCompleted,
		    t.assignee,
		    t.priority,
			t.type,
			t.status
		FROM checklist c
			INNER JOIN task t ON t.checklist = c.id
		WHERE c.project = ?
	`
	args := []any{projectId}

	if taskFilters.SearchQuery != "" {
		query += " AND t.name LIKE ?"
		args = append(args, "%"+taskFilters.SearchQuery+"%")
	}

	if len(taskFilters.ChecklistQuery) > 0 {
		query += " AND t.checklist IN (" + strings.TrimRight(strings.Repeat("?,", len(taskFilters.ChecklistQuery)), ",") + ")"
		for _, v := range taskFilters.ChecklistQuery {
			args = append(args, v)
		}
	}

	if len(taskFilters.TypeQuery) > 0 {
		query += " AND t.type IN (" + strings.TrimRight(strings.Repeat("?,", len(taskFilters.TypeQuery)), ",") + ")"
		for _, v := range taskFilters.TypeQuery {
			args = append(args, v)
		}
	}

	if len(taskFilters.StatusQuery) > 0 {
		query += " AND t.status IN (" + strings.TrimRight(strings.Repeat("?,", len(taskFilters.StatusQuery)), ",") + ")"
		for _, v := range taskFilters.StatusQuery {
			args = append(args, v)
		}
	}

	if len(taskFilters.PriorityQuery) > 0 {
		query += " AND t.priority IN (" + strings.TrimRight(strings.Repeat("?,", len(taskFilters.PriorityQuery)), ",") + ")"
		for _, v := range taskFilters.PriorityQuery {
			args = append(args, v)
		}
	}

	if len(taskFilters.AssigneeQuery) > 0 {
		query += " AND t.assignee IN (" + strings.TrimRight(strings.Repeat("?,", len(taskFilters.AssigneeQuery)), ",") + ")"
		for _, v := range taskFilters.AssigneeQuery {
			args = append(args, v)
		}
	}

	query += " ORDER BY t.timePlannedStart, t.timePlannedEnd, t.timeCreated DESC"

	rows, err := repo.DB.Query(query, args...)
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
			&ct.TimePlannedStart,
			&ct.TimePlannedEnd,
			&ct.TimeCompleted,
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

func (repo *TaskRepo) CreateTask(newTask *models.ChecklistTask) (*models.Task, error) {
	query := `
		INSERT INTO task (name, body, checklist, timePlannedStart, timePlannedEnd, assignee, priority, type, status)
		VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
		RETURNING id;
	`
	res, err := repo.DB.Exec(
		query,
		newTask.Name,
		newTask.Body,
		newTask.Checklist,
		newTask.TimePlannedStart,
		newTask.TimePlannedEnd,
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
			body = ?,
			checklist = ?,
			timeCreated = ?,
			timePlannedStart = ?,
			timePlannedEnd = ?,
			timeCompleted = ?,
			assignee = ?,
			priority = ?,
			type = ?,
			status = ?
		WHERE id = ?;
	`

	res, err := repo.DB.Exec(
		query,
		task.Name,
		task.Body,
		task.Checklist,
		task.TimeCreated,
		task.TimePlannedStart,
		task.TimePlannedEnd,
		task.TimeCompleted,
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
			t.body,
			t.timeCreated,
			t.timePlannedStart,
			t.timePlannedEnd,
			t.timeCompleted,
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
		&task.Body,
		&task.TimeCreated,
		&task.TimePlannedStart,
		&task.TimePlannedEnd,
		&task.TimeCompleted,
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

	rowsAffected, err := res.RowsAffected()
	if err != nil {
		return false, err
	}

	return rowsAffected > 0, nil
}

func (repo *TaskRepo) GetTaskBody(taskId int) (string, error) {
	query := "SELECT t.body FROM task t WHERE t.id = ?;"
	rows, err := repo.DB.Query(query, taskId)
	if err != nil {
		return "[]", err
	}

	rows.Next()
	err = rows.Err()
	if err != nil {
		return "[]", err
	}

	taskBody := "[]"
	err = rows.Scan(&taskBody)
	if err != nil {
		return "[]", err
	}

	defer rows.Close()

	return taskBody, nil
}
