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

func (repo *WorkflowRepo) FirstWorkflow() (*models.Workflow, error) {
	query := "SELECT " + workflowColumns + " FROM workflow ORDER BY id LIMIT 1;"
	row := repo.DB.QueryRow(query)

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

const stageColumns = "id, workflow, name, COALESCE(description, ''), color, icon, position, type, timeCreated, timeModified"

func scanStage(scanner interface {
	Scan(...any) error
}, s *models.Stage) error {
	return scanner.Scan(
		&s.ID,
		&s.Workflow,
		&s.Name,
		&s.Description,
		&s.Color,
		&s.Icon,
		&s.Position,
		&s.Type,
		&s.TimeCreated,
		&s.TimeModified,
	)
}

func (repo *WorkflowRepo) StagesByWorkflow(workflowId int, limit int) ([]models.Stage, error) {
	query := "SELECT " + stageColumns + " FROM stage WHERE workflow = ? ORDER BY position"
	args := []any{workflowId}
	if limit > 0 {
		query += " LIMIT ?"
		args = append(args, limit)
	}
	query += ";"

	rows, err := repo.DB.Query(query, args...)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	stages := []models.Stage{}
	for rows.Next() {
		s := models.Stage{}
		if err := scanStage(rows, &s); err != nil {
			return nil, err
		}
		stages = append(stages, s)
	}

	return stages, rows.Err()
}

func (repo *WorkflowRepo) CreateStage(stage *models.Stage) (int64, error) {
	query := `
		INSERT INTO stage (workflow, name, description, color, icon, position, type)
		VALUES (?, ?, ?, ?, ?, ?, ?);
	`
	res, err := repo.DB.Exec(
		query,
		stage.Workflow,
		stage.Name,
		stage.Description,
		stage.Color,
		stage.Icon,
		stage.Position,
		stage.Type,
	)
	if err != nil {
		return 0, err
	}

	return res.LastInsertId()
}

func (repo *WorkflowRepo) FirstStageByType(workflowId int, stageType string) (*models.Stage, error) {
	query := "SELECT " + stageColumns + " FROM stage WHERE workflow = ? AND type = ? ORDER BY position LIMIT 1;"
	row := repo.DB.QueryRow(query, workflowId, stageType)

	s := models.Stage{}
	err := scanStage(row, &s)
	if err != nil {
		return nil, err
	}

	return &s, nil
}
