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
	StageQuery     []string
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
			t.timeModified,
		    t.timePlannedStart,
		    t.timePlannedEnd,
		    t.timeCompleted,
		    t.assignee,
		    t.priority,
			t.type,
			t.stage
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

	if len(taskFilters.StageQuery) > 0 {
		query += " AND t.stage IN (" + strings.TrimRight(strings.Repeat("?,", len(taskFilters.StageQuery)), ",") + ")"
		for _, v := range taskFilters.StageQuery {
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
			&ct.TimeModified,
			&ct.TimePlannedStart,
			&ct.TimePlannedEnd,
			&ct.TimeCompleted,
			&ct.Assignee,
			&ct.Priority,
			&ct.Type,
			&ct.Stage,
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
		INSERT INTO task (name, body, checklist, timePlannedStart, timePlannedEnd, assignee, priority, type, stage)
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
		newTask.Stage,
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
			timePlannedStart = ?,
			timePlannedEnd = ?,
			timeCompleted = ?,
			assignee = ?,
			priority = ?,
			type = ?,
			stage = ?
		WHERE id = ?;
	`

	res, err := repo.DB.Exec(
		query,
		task.Name,
		task.Body,
		task.Checklist,
		task.TimePlannedStart,
		task.TimePlannedEnd,
		task.TimeCompleted,
		task.Assignee,
		task.Priority,
		task.Type,
		task.Stage,
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
			t.timeModified,
			t.timePlannedStart,
			t.timePlannedEnd,
			t.timeCompleted,
			t.assignee,
			t.priority,
			t.type,
			t.stage,
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
		&task.TimeModified,
		&task.TimePlannedStart,
		&task.TimePlannedEnd,
		&task.TimeCompleted,
		&task.Assignee,
		&task.Priority,
		&task.Type,
		&task.Stage,
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

func (repo *TaskRepo) UpdateManyFields(ids []int, fields map[string]any) (int, error) {
	if len(ids) == 0 || len(fields) == 0 {
		return 0, nil
	}

	setParts := []string{}
	setArgs := []any{}
	for col, val := range fields {
		setParts = append(setParts, col+" = ?")
		setArgs = append(setArgs, val)
	}

	placeholders, idArgs := intIdPlaceholders(ids)
	query := "UPDATE task SET " + strings.Join(setParts, ", ") +
		" WHERE id IN (" + placeholders + ");"

	args := append(setArgs, idArgs...)
	res, err := repo.DB.Exec(query, args...)
	if err != nil {
		return 0, err
	}
	affected, err := res.RowsAffected()
	if err != nil {
		return 0, err
	}
	return int(affected), nil
}

func (repo *TaskRepo) DeleteMany(ids []int) (int, error) {
	if len(ids) == 0 {
		return 0, nil
	}
	placeholders, args := intIdPlaceholders(ids)
	query := "DELETE FROM task WHERE id IN (" + placeholders + ");"

	res, err := repo.DB.Exec(query, args...)
	if err != nil {
		return 0, err
	}
	affected, err := res.RowsAffected()
	if err != nil {
		return 0, err
	}
	return int(affected), nil
}

func (repo *TaskRepo) DeleteTasksInProject(projectId int) (bool, error) {
	query := `
		DELETE FROM task WHERE checklist IN (
			SELECT id FROM checklist WHERE project = ?
		);
    `

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
