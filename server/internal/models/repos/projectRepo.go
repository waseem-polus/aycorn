package repos

import (
	"database/sql"
	"strings"

	models "github.com/waseem-polus/aycorn/server/internal/models"
)

type ProjectRepo struct {
	DB *sql.DB
}

const projectColumns = "id, name, pinned, workflow, timeCreated, timeModified"

func scanProject(scanner interface {
	Scan(...any) error
}, p *models.Project) error {
	return scanner.Scan(&p.ID, &p.Name, &p.Pinned, &p.Workflow, &p.TimeCreated, &p.TimeModified)
}

func (repo *ProjectRepo) All() ([]models.Project, error) {
	query := "SELECT " + projectColumns + " FROM project ORDER BY id DESC;"
	rows, err := repo.DB.Query(query)
	if err != nil {
		return nil, err
	}

	projects := []models.Project{}

	for rows.Next() {
		p := models.Project{}

		err := scanProject(rows, &p)
		if err != nil {
			return nil, err
		}

		projects = append(projects, p)
	}

	err = rows.Err()
	if err != nil {
		return nil, err
	}

	defer rows.Close()

	return projects, nil
}

func (repo *ProjectRepo) FindOne(id int) (*models.Project, error) {
	query := "SELECT " + projectColumns + " FROM project WHERE id = ?;"
	rows, err := repo.DB.Query(query, id)
	if err != nil {
		return nil, err
	}

	rows.Next()

	project := models.Project{}
	err = scanProject(rows, &project)
	if err != nil {
		return nil, err
	}

	defer rows.Close()

	return &project, nil
}

func (repo *ProjectRepo) FindPinnedProjects() ([]models.Project, error) {
	query := "SELECT " + projectColumns + " FROM project WHERE pinned = TRUE;"
	rows, err := repo.DB.Query(query)
	if err != nil {
		return nil, err
	}

	projects := []models.Project{}

	for rows.Next() {
		p := models.Project{}

		err := scanProject(rows, &p)
		if err != nil {
			return nil, err
		}

		projects = append(projects, p)
	}

	err = rows.Err()
	if err != nil {
		return nil, err
	}

	defer rows.Close()

	return projects, nil
}

func (repo *ProjectRepo) UpdateProject(project *models.Project) (bool, error) {
	query := "UPDATE project SET name = ?, pinned = ?, workflow = ? WHERE id = ?;"
	res, err := repo.DB.Exec(query, project.Name, project.Pinned, project.Workflow, project.ID)
	if err != nil {
		return false, err
	}

	affected, err := res.RowsAffected()
	if err != nil {
		return false, err
	}

	return affected > 0, nil
}

func (repo *ProjectRepo) CreateProject(workflowId int) (int64, error) {
	query := "INSERT INTO project (name, pinned, workflow) VALUES ('', false, ?);"
	res, err := repo.DB.Exec(query, workflowId)
	if err != nil {
		return 0, err
	}

	id, err := res.LastInsertId()
	if err != nil {
		return 0, err
	}

	return id, nil
}

func (repo *ProjectRepo) DeleteProject(projectId int) (bool, error) {
	query := "DELETE FROM project WHERE id = ?;"
	res, err := repo.DB.Exec(query, projectId)
	if err != nil {
		return false, err
	}

	affected, err := res.RowsAffected()
	if err != nil {
		return false, err
	}

	return affected > 0, nil
}

func intIdPlaceholders(ids []int) (string, []any) {
	placeholders := strings.TrimRight(strings.Repeat("?,", len(ids)), ",")
	args := make([]any, len(ids))
	for i, id := range ids {
		args[i] = id
	}
	return placeholders, args
}

func (repo *ProjectRepo) UpdateManyPinned(ids []int, pinned bool) (int, error) {
	if len(ids) == 0 {
		return 0, nil
	}
	placeholders, args := intIdPlaceholders(ids)
	query := "UPDATE project SET pinned = ? WHERE id IN (" + placeholders + ");"
	args = append([]any{pinned}, args...)

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

func (repo *ProjectRepo) DeleteMany(ids []int) (int, error) {
	if len(ids) == 0 {
		return 0, nil
	}

	tx, err := repo.DB.Begin()
	if err != nil {
		return 0, err
	}
	defer tx.Rollback()

	placeholders, args := intIdPlaceholders(ids)

	if _, err := tx.Exec(
		"DELETE FROM task WHERE checklist IN (SELECT id FROM checklist WHERE project IN ("+placeholders+"));",
		args...,
	); err != nil {
		return 0, err
	}

	if _, err := tx.Exec(
		"DELETE FROM checklist WHERE project IN ("+placeholders+");",
		args...,
	); err != nil {
		return 0, err
	}

	res, err := tx.Exec(
		"DELETE FROM project WHERE id IN ("+placeholders+");",
		args...,
	)
	if err != nil {
		return 0, err
	}

	if err := tx.Commit(); err != nil {
		return 0, err
	}

	affected, err := res.RowsAffected()
	if err != nil {
		return 0, err
	}
	return int(affected), nil
}

func (repo *ProjectRepo) CountByWorkflow(workflowId int) (int, error) {
	query := "SELECT COUNT(*) FROM project WHERE workflow = ?;"
	var count int
	err := repo.DB.QueryRow(query, workflowId).Scan(&count)
	if err != nil {
		return 0, err
	}
	return count, nil
}
