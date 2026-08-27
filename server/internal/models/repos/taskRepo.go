package repos

import (
	"database/sql"
	"strings"

	models "github.com/waseem-polus/aycorn/server/internal/models"
	"github.com/waseem-polus/aycorn/server/internal/timefmt"
)

type TaskRepo struct {
	DB *sql.DB
}

type TaskFilters struct {
	SearchQuery    string
	ChecklistQuery []string
	TypeIDQuery    []int
	StageQuery     []string
	PriorityQuery  []string
	AssigneeQuery  []string
	ProjectIDQuery []int
	// Date bounds are canonical timefmt.Layout strings, normalized by the
	// handler. They are compared directly against the stored values, which use
	// the same encoding — no DATE() truncation, no per-request branching.
	PlannedFrom   string
	PlannedTo     string
	CompletedFrom string
	CompletedTo   string
}

// taskTypeSelect is the SELECT fragment for the task_type JOIN columns.
const taskTypeSelect = `
	tt.id,
	tt.name,
	COALESCE(tt.description, ''),
	tt.icon,
	tt.color,
	tt.isDefault`

// scanTaskTypeInto scans the 6 task_type columns (produced by taskTypeSelect) into tt.
func scanTaskTypeInto(scanner interface{ Scan(...any) error }, tt *models.TaskType) error {
	return scanner.Scan(&tt.ID, &tt.Name, &tt.Description, &tt.Icon, &tt.Color, &tt.IsDefault)
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
		    t.hasTimePlannedStart,
		    t.hasTimePlannedEnd,
		    t.timeCompleted,
		    t.assignee,
		    t.priority,
			t.stage,
			` + taskTypeSelect + `
		FROM checklist c
			INNER JOIN task t ON t.checklist = c.id
			INNER JOIN task_type tt ON tt.id = t.type
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

	if len(taskFilters.TypeIDQuery) > 0 {
		query += " AND t.type IN (" + strings.TrimRight(strings.Repeat("?,", len(taskFilters.TypeIDQuery)), ",") + ")"
		for _, v := range taskFilters.TypeIDQuery {
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
	defer rows.Close()

	checklistTasks := []models.ChecklistTask{}
	for rows.Next() {
		ct := models.ChecklistTask{}
		if err := rows.Scan(
			&ct.Checklist,
			&ct.ChecklistName,
			&ct.ID,
			&ct.Name,
			&ct.TimeCreated,
			&ct.TimeModified,
			&ct.TimePlannedStart,
			&ct.TimePlannedEnd,
			&ct.HasTimePlannedStart,
			&ct.HasTimePlannedEnd,
			&ct.TimeCompleted,
			&ct.Assignee,
			&ct.Priority,
			&ct.Stage,
			&ct.Type.ID,
			&ct.Type.Name,
			&ct.Type.Description,
			&ct.Type.Icon,
			&ct.Type.Color,
			&ct.Type.IsDefault,
		); err != nil {
			return nil, err
		}
		checklistTasks = append(checklistTasks, ct)
	}
	return checklistTasks, rows.Err()
}

func (repo *TaskRepo) CreateTask(newTask *models.ChecklistTask) (*models.ChecklistTask, error) {
	query := `
		INSERT INTO task (name, body, checklist, timePlannedStart, timePlannedEnd, hasTimePlannedStart, hasTimePlannedEnd, assignee, priority, type, stage)
		VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
		RETURNING id;
	`
	res, err := repo.DB.Exec(
		query,
		newTask.Name,
		newTask.Body,
		newTask.Checklist,
		timefmt.Format(newTask.TimePlannedStart),
		timefmt.Format(newTask.TimePlannedEnd),
		newTask.HasTimePlannedStart,
		newTask.HasTimePlannedEnd,
		newTask.Assignee,
		newTask.Priority,
		newTask.Type.ID,
		newTask.Stage,
	)
	if err != nil {
		return nil, err
	}

	id, err := res.LastInsertId()
	if err != nil {
		return nil, err
	}

	return repo.FindOne(id)
}

func (repo *TaskRepo) UpdateTask(task *models.ChecklistTask) (bool, error) {
	// body is deliberately not updated here — it is written only through
	// UpdateTaskBody so that property/name/stage/date edits (which often carry
	// a task object with no loaded body) can never clobber the stored body.
	query := `
		UPDATE task SET
			name = ?,
			checklist = ?,
			timePlannedStart = ?,
			timePlannedEnd = ?,
			hasTimePlannedStart = ?,
			hasTimePlannedEnd = ?,
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
		task.Checklist,
		timefmt.Format(task.TimePlannedStart),
		timefmt.Format(task.TimePlannedEnd),
		task.HasTimePlannedStart,
		task.HasTimePlannedEnd,
		timefmt.Format(task.TimeCompleted),
		task.Assignee,
		task.Priority,
		task.Type.ID,
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

func (repo *TaskRepo) UpdateTaskBody(taskId int, body string) (bool, error) {
	query := `UPDATE task SET body = ? WHERE id = ?;`

	res, err := repo.DB.Exec(query, body, taskId)
	if err != nil {
		return false, err
	}

	rowsAffected, err := res.RowsAffected()
	if err != nil {
		return false, err
	}

	return rowsAffected > 0, nil
}

func (repo *TaskRepo) FindOne(taskId int64) (*models.ChecklistTask, error) {
	query := `
		SELECT
			t.id,
			t.name,
			t.body,
			t.timeCreated,
			t.timeModified,
			t.timePlannedStart,
			t.timePlannedEnd,
			t.hasTimePlannedStart,
			t.hasTimePlannedEnd,
			t.timeCompleted,
			t.assignee,
			t.priority,
			t.stage,
			t.checklist,
			c.name,
			` + taskTypeSelect + `
		FROM task t
		INNER JOIN checklist c ON c.id = t.checklist
		INNER JOIN task_type tt ON tt.id = t.type
		WHERE t.id = ?;
	`
	rows, err := repo.DB.Query(query, taskId)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	if !rows.Next() {
		if err := rows.Err(); err != nil {
			return nil, err
		}
		return nil, sql.ErrNoRows
	}

	task := models.ChecklistTask{}
	err = rows.Scan(
		&task.ID,
		&task.Name,
		&task.Body,
		&task.TimeCreated,
		&task.TimeModified,
		&task.TimePlannedStart,
		&task.TimePlannedEnd,
		&task.HasTimePlannedStart,
		&task.HasTimePlannedEnd,
		&task.TimeCompleted,
		&task.Assignee,
		&task.Priority,
		&task.Stage,
		&task.Checklist,
		&task.ChecklistName,
		&task.Type.ID,
		&task.Type.Name,
		&task.Type.Description,
		&task.Type.Icon,
		&task.Type.Color,
		&task.Type.IsDefault,
	)
	if err != nil {
		return nil, err
	}

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

func (repo *TaskRepo) FindOneWithProject(taskId int) (*models.TaskWithProject, error) {
	query := `
		SELECT
			t.id,
			t.name,
			COALESCE(t.body, '[]'),
			t.timeCreated,
			t.timeModified,
			t.timePlannedStart,
			t.timePlannedEnd,
			t.hasTimePlannedStart,
			t.hasTimePlannedEnd,
			t.timeCompleted,
			COALESCE(t.assignee, ''),
			t.priority,
			t.stage,
			t.checklist,
			c.name,
			c.project,
			` + taskTypeSelect + `
		FROM task t
		INNER JOIN checklist c ON c.id = t.checklist
		INNER JOIN task_type tt ON tt.id = t.type
		WHERE t.id = ?;
	`
	rows, err := repo.DB.Query(query, taskId)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	if !rows.Next() {
		if err := rows.Err(); err != nil {
			return nil, err
		}
		return nil, sql.ErrNoRows
	}

	task := models.TaskWithProject{}
	err = rows.Scan(
		&task.ID,
		&task.Name,
		&task.Body,
		&task.TimeCreated,
		&task.TimeModified,
		&task.TimePlannedStart,
		&task.TimePlannedEnd,
		&task.HasTimePlannedStart,
		&task.HasTimePlannedEnd,
		&task.TimeCompleted,
		&task.Assignee,
		&task.Priority,
		&task.Stage,
		&task.Checklist,
		&task.ChecklistName,
		&task.ProjectID,
		&task.Type.ID,
		&task.Type.Name,
		&task.Type.Description,
		&task.Type.Icon,
		&task.Type.Color,
		&task.Type.IsDefault,
	)
	if err != nil {
		return nil, err
	}

	return &task, nil
}

func (repo *TaskRepo) AllTasks(taskFilters *TaskFilters) ([]models.TaskWithProject, error) {
	query := `
		SELECT
			c.id,
			c.name,
			c.project,
			t.id,
		    t.name,
			t.timeCreated,
			t.timeModified,
		    t.timePlannedStart,
		    t.timePlannedEnd,
		    t.hasTimePlannedStart,
		    t.hasTimePlannedEnd,
		    t.timeCompleted,
		    COALESCE(t.assignee, ''),
		    t.priority,
			t.stage,
			` + taskTypeSelect + `
		FROM checklist c
			INNER JOIN task t ON t.checklist = c.id
			INNER JOIN task_type tt ON tt.id = t.type
		WHERE 1=1
	`
	args := []any{}

	if taskFilters.SearchQuery != "" {
		query += " AND t.name LIKE ?"
		args = append(args, "%"+taskFilters.SearchQuery+"%")
	}

	if len(taskFilters.ProjectIDQuery) > 0 {
		query += " AND c.project IN (" + strings.TrimRight(strings.Repeat("?,", len(taskFilters.ProjectIDQuery)), ",") + ")"
		for _, v := range taskFilters.ProjectIDQuery {
			args = append(args, v)
		}
	}

	if len(taskFilters.ChecklistQuery) > 0 {
		query += " AND t.checklist IN (" + strings.TrimRight(strings.Repeat("?,", len(taskFilters.ChecklistQuery)), ",") + ")"
		for _, v := range taskFilters.ChecklistQuery {
			args = append(args, v)
		}
	}

	if len(taskFilters.TypeIDQuery) > 0 {
		query += " AND t.type IN (" + strings.TrimRight(strings.Repeat("?,", len(taskFilters.TypeIDQuery)), ",") + ")"
		for _, v := range taskFilters.TypeIDQuery {
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

	// Planned dates use overlap semantics: a task matches when any part of its
	// planned window intersects the range. Hence the range start is tested
	// against the task's END (falling back to start for open-ended tasks) and
	// the range end against the task's START.
	if taskFilters.PlannedFrom != "" {
		query += " AND COALESCE(t.timePlannedEnd, t.timePlannedStart) >= ?"
		args = append(args, taskFilters.PlannedFrom)
	}
	if taskFilters.PlannedTo != "" {
		query += " AND t.timePlannedStart <= ?"
		args = append(args, taskFilters.PlannedTo)
	}
	if taskFilters.CompletedFrom != "" {
		query += " AND t.timeCompleted >= ?"
		args = append(args, taskFilters.CompletedFrom)
	}
	if taskFilters.CompletedTo != "" {
		query += " AND t.timeCompleted <= ?"
		args = append(args, taskFilters.CompletedTo)
	}

	query += " ORDER BY t.timePlannedStart, t.timePlannedEnd, t.timeCreated DESC"

	rows, err := repo.DB.Query(query, args...)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	tasks := []models.TaskWithProject{}
	for rows.Next() {
		t := models.TaskWithProject{}
		if err := rows.Scan(
			&t.Checklist,
			&t.ChecklistName,
			&t.ProjectID,
			&t.ID,
			&t.Name,
			&t.TimeCreated,
			&t.TimeModified,
			&t.TimePlannedStart,
			&t.TimePlannedEnd,
			&t.HasTimePlannedStart,
			&t.HasTimePlannedEnd,
			&t.TimeCompleted,
			&t.Assignee,
			&t.Priority,
			&t.Stage,
			&t.Type.ID,
			&t.Type.Name,
			&t.Type.Description,
			&t.Type.Icon,
			&t.Type.Color,
			&t.Type.IsDefault,
		); err != nil {
			return nil, err
		}
		tasks = append(tasks, t)
	}
	return tasks, rows.Err()
}

func (repo *TaskRepo) TaskFacets() (*models.TaskFacets, error) {
	facets := &models.TaskFacets{
		Assignees:  []string{},
		Checklists: []models.ChecklistFacet{},
	}

	assigneeRows, err := repo.DB.Query(`
		SELECT DISTINCT assignee
		FROM task
		WHERE assignee IS NOT NULL AND assignee <> ''
		ORDER BY assignee
	`)
	if err != nil {
		return nil, err
	}
	defer assigneeRows.Close()
	for assigneeRows.Next() {
		var a string
		if err := assigneeRows.Scan(&a); err != nil {
			return nil, err
		}
		facets.Assignees = append(facets.Assignees, a)
	}
	if err := assigneeRows.Err(); err != nil {
		return nil, err
	}

	checklistRows, err := repo.DB.Query(`
		SELECT c.id, c.name, c.project
		FROM checklist c
		WHERE EXISTS (SELECT 1 FROM task t WHERE t.checklist = c.id)
		ORDER BY c.project, c.name
	`)
	if err != nil {
		return nil, err
	}
	defer checklistRows.Close()
	for checklistRows.Next() {
		cf := models.ChecklistFacet{}
		if err := checklistRows.Scan(&cf.ID, &cf.Name, &cf.ProjectID); err != nil {
			return nil, err
		}
		facets.Checklists = append(facets.Checklists, cf)
	}
	return facets, checklistRows.Err()
}

func (repo *TaskRepo) GetTaskBody(taskId int) (string, error) {
	query := "SELECT COALESCE(t.body, '') FROM task t WHERE t.id = ?;"
	rows, err := repo.DB.Query(query, taskId)
	if err != nil {
		return "[]", err
	}
	defer rows.Close()

	if !rows.Next() {
		return "[]", rows.Err()
	}

	taskBody := "[]"
	err = rows.Scan(&taskBody)
	if err != nil {
		return "[]", err
	}

	// A valid body is always a serialized Plate document (a JSON array). Rows
	// damaged by the historical body-clobber bug hold "" or the JSON-encoded
	// empty string (`""`), neither of which parses into a document. Normalize
	// anything that isn't array-shaped to an empty document.
	if !strings.HasPrefix(strings.TrimSpace(taskBody), "[") {
		return "[]", nil
	}

	return taskBody, nil
}
