package repos

import (
	"database/sql"

	models "github.com/waseem-polus/aycorn/server/internal/models"
)

type WorkflowRepo struct {
	DB *sql.DB
}

type StageDefault struct {
	Name        string
	Description string
	Color       string
	Icon        string
	Type        string
}

var StageDefaults = map[string]StageDefault{
	"blocked": {Name: "Blocked", Description: "Tasks cannot be started", Color: "red", Icon: "circle-minus", Type: "blocked"},
	"open":    {Name: "Open", Description: "Tasks are being planned", Color: "gray", Icon: "circle-dashed", Type: "open"},
	"todo":    {Name: "Todo", Description: "Tasks are ready to start", Color: "orange", Icon: "circle", Type: "todo"},
	"doing":   {Name: "Doing", Description: "Tasks are being worked on", Color: "green", Icon: "circle-dot", Type: "doing"},
	"done":    {Name: "Done", Description: "Tasks are completed", Color: "purple", Icon: "circle-check", Type: "done"},
}

const workflowColumns = "id, name, COALESCE(description, ''), timeCreated, timeModified"

func scanWorkflow(scanner interface {
	Scan(...any) error
}, w *models.Workflow) error {
	return scanner.Scan(&w.ID, &w.Name, &w.Description, &w.TimeCreated, &w.TimeModified)
}

func (repo *WorkflowRepo) All() ([]models.Workflow, error) {
	query := "SELECT " + workflowColumns + " FROM workflow ORDER BY id;"
	rows, err := repo.DB.Query(query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	workflows := []models.Workflow{}
	for rows.Next() {
		w := models.Workflow{}
		if err := scanWorkflow(rows, &w); err != nil {
			return nil, err
		}
		workflows = append(workflows, w)
	}

	return workflows, rows.Err()
}

func (repo *WorkflowRepo) FindOne(id int) (*models.Workflow, error) {
	query := "SELECT " + workflowColumns + " FROM workflow WHERE id = ?;"
	row := repo.DB.QueryRow(query, id)

	w := models.Workflow{}
	err := scanWorkflow(row, &w)
	if err != nil {
		return nil, err
	}

	return &w, nil
}

func (repo *WorkflowRepo) Create(name, description string) (int64, error) {
	query := "INSERT INTO workflow (name, description) VALUES (?, ?);"
	res, err := repo.DB.Exec(query, name, description)
	if err != nil {
		return 0, err
	}

	return res.LastInsertId()
}

// CreateWithStages inserts a workflow and all of its stages in a single
// transaction so a mid-loop failure can never leave a half-built workflow
// (e.g. one missing its `open` stage, which would break the one-open-stage
// invariant for every project later assigned to it).
func (repo *WorkflowRepo) CreateWithStages(name, description string, stages []models.Stage) (int64, error) {
	tx, err := repo.DB.Begin()
	if err != nil {
		return 0, err
	}
	defer tx.Rollback()

	res, err := tx.Exec("INSERT INTO workflow (name, description) VALUES (?, ?);", name, description)
	if err != nil {
		return 0, err
	}
	newID, err := res.LastInsertId()
	if err != nil {
		return 0, err
	}

	stmt, err := tx.Prepare(`
		INSERT INTO stage (workflow, name, description, color, icon, position, type)
		VALUES (?, ?, ?, ?, ?, ?, ?);
	`)
	if err != nil {
		return 0, err
	}
	defer stmt.Close()

	for _, st := range stages {
		if _, err := stmt.Exec(
			newID, st.Name, st.Description, st.Color, st.Icon, st.Position, st.Type,
		); err != nil {
			return 0, err
		}
	}

	if err := tx.Commit(); err != nil {
		return 0, err
	}
	return newID, nil
}

func (repo *WorkflowRepo) Update(workflow *models.Workflow) (bool, error) {
	query := "UPDATE workflow SET name = ?, description = ? WHERE id = ?;"
	res, err := repo.DB.Exec(query, workflow.Name, workflow.Description, workflow.ID)
	if err != nil {
		return false, err
	}

	affected, err := res.RowsAffected()
	if err != nil {
		return false, err
	}

	return affected > 0, nil
}

func (repo *WorkflowRepo) Delete(id int) (bool, error) {
	query := "DELETE FROM workflow WHERE id = ?;"
	res, err := repo.DB.Exec(query, id)
	if err != nil {
		return false, err
	}

	affected, err := res.RowsAffected()
	if err != nil {
		return false, err
	}

	return affected > 0, nil
}

func (repo *WorkflowRepo) DeleteMany(ids []int) (int, error) {
	if len(ids) == 0 {
		return 0, nil
	}
	placeholders, args := intIdPlaceholders(ids)
	query := "DELETE FROM workflow WHERE id IN (" + placeholders + ");"

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
