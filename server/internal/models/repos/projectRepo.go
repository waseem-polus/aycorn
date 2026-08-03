package repos

import (
	"database/sql"
	"strings"

	models "github.com/waseem-polus/aycorn/server/internal/models"
)

type ProjectRepo struct {
	DB *sql.DB
}

// Pinned has no column of its own — it is membership in pinned_project.
const projectSelect = `
SELECT p.id, p.name,
       EXISTS(SELECT 1 FROM pinned_project pp WHERE pp.project = p.id),
       p.archived, p.folder, p.workflow, w.name, p.timeCreated, p.timeModified
FROM project p
JOIN workflow w ON p.workflow = w.id`

func scanProject(scanner interface {
	Scan(...any) error
}, p *models.Project) error {
	return scanner.Scan(&p.ID, &p.Name, &p.Pinned, &p.Archived, &p.Folder, &p.Workflow, &p.WorkflowName, &p.TimeCreated, &p.TimeModified)
}

// All returns projects most recently updated first — the order the projects page
// renders cards in. A nil archived filter returns both open and archived, which
// is what callers outside the projects page (task pickers, the upcoming page)
// want: archiving is a projects-page concern only.
func (repo *ProjectRepo) All(archived *bool) ([]models.Project, error) {
	query := projectSelect
	args := []any{}
	if archived != nil {
		query += " WHERE p.archived = ?"
		args = append(args, *archived)
	}
	query += " ORDER BY p.timeModified DESC;"

	rows, err := repo.DB.Query(query, args...)
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
	query := projectSelect + " WHERE p.id = ?;"
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

// FindPinnedProjects returns the sidebar list, in the user's manual pin order.
// Archived projects are force-unpinned, so the join alone can't return one.
func (repo *ProjectRepo) FindPinnedProjects() ([]models.Project, error) {
	query := projectSelect + `
JOIN pinned_project pin ON pin.project = p.id
WHERE p.archived = 0
ORDER BY pin.sortIndex ASC, p.id ASC;`
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

// UpdateProject deliberately does not write `pinned` or `archived`: pinning
// lives in pinned_project, and archiving has to force-unpin in the same tx.
func (repo *ProjectRepo) UpdateProject(project *models.Project) (bool, error) {
	query := "UPDATE project SET name = ?, workflow = ?, folder = ? WHERE id = ?;"
	res, err := repo.DB.Exec(query, project.Name, project.Workflow, project.Folder, project.ID)
	if err != nil {
		return false, err
	}

	affected, err := res.RowsAffected()
	if err != nil {
		return false, err
	}

	return affected > 0, nil
}

func (repo *ProjectRepo) CreateProject(workflowId int, folderId int) (int64, error) {
	query := "INSERT INTO project (name, workflow, folder) VALUES ('', ?, ?);"
	res, err := repo.DB.Exec(query, workflowId, folderId)
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

// UpdateManyPinned pins by inserting into pinned_project and unpins by deleting.
// Newly pinned projects are appended after the existing pin order. Ids that
// don't exist, are already in the requested state, or are archived simply don't
// affect a row — the caller reports them as skipped.
func (repo *ProjectRepo) UpdateManyPinned(ids []int, pinned bool) (int, error) {
	if len(ids) == 0 {
		return 0, nil
	}

	if !pinned {
		placeholders, args := intIdPlaceholders(ids)
		res, err := repo.DB.Exec(
			"DELETE FROM pinned_project WHERE project IN ("+placeholders+");", args...,
		)
		if err != nil {
			return 0, err
		}
		affected, err := res.RowsAffected()
		if err != nil {
			return 0, err
		}
		return int(affected), nil
	}

	tx, err := repo.DB.Begin()
	if err != nil {
		return 0, err
	}
	defer tx.Rollback()

	next := 0
	if err := tx.QueryRow(
		"SELECT COALESCE(MAX(sortIndex), -1) + 1 FROM pinned_project;",
	).Scan(&next); err != nil {
		return 0, err
	}

	// The guard is in SQL so an archived project is skipped server-side rather
	// than being filtered out by the caller.
	stmt, err := tx.Prepare(
		"INSERT OR IGNORE INTO pinned_project (project, sortIndex)" +
			" SELECT id, ? FROM project WHERE id = ? AND archived = 0;",
	)
	if err != nil {
		return 0, err
	}
	defer stmt.Close()

	pinnedCount := 0
	for _, id := range ids {
		res, err := stmt.Exec(next, id)
		if err != nil {
			return 0, err
		}
		affected, err := res.RowsAffected()
		if err != nil {
			return 0, err
		}
		if affected > 0 {
			pinnedCount++
			next++
		}
	}

	if err := tx.Commit(); err != nil {
		return 0, err
	}
	return pinnedCount, nil
}

// UpdateManyArchived archives or restores projects. Archiving force-unpins in
// the same transaction, so a project can never be both archived and pinned.
func (repo *ProjectRepo) UpdateManyArchived(ids []int, archived bool) (int, error) {
	if len(ids) == 0 {
		return 0, nil
	}

	tx, err := repo.DB.Begin()
	if err != nil {
		return 0, err
	}
	defer tx.Rollback()

	placeholders, args := intIdPlaceholders(ids)

	res, err := tx.Exec(
		"UPDATE project SET archived = ? WHERE id IN ("+placeholders+") AND archived <> ?;",
		append(append([]any{archived}, args...), archived)...,
	)
	if err != nil {
		return 0, err
	}

	if archived {
		if _, err := tx.Exec(
			"DELETE FROM pinned_project WHERE project IN ("+placeholders+");", args...,
		); err != nil {
			return 0, err
		}
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

func (repo *ProjectRepo) UpdateManyFolder(ids []int, folderId int) (int, error) {
	if len(ids) == 0 {
		return 0, nil
	}
	placeholders, args := intIdPlaceholders(ids)
	res, err := repo.DB.Exec(
		"UPDATE project SET folder = ? WHERE id IN ("+placeholders+");",
		append([]any{folderId}, args...)...,
	)
	if err != nil {
		return 0, err
	}
	affected, err := res.RowsAffected()
	if err != nil {
		return 0, err
	}
	return int(affected), nil
}

// ReorderPinned rewrites the sidebar pin order. Ids that aren't pinned match no
// row and are ignored; the service validates the set before calling.
func (repo *ProjectRepo) ReorderPinned(ids []int) error {
	tx, err := repo.DB.Begin()
	if err != nil {
		return err
	}
	defer tx.Rollback()

	stmt, err := tx.Prepare("UPDATE pinned_project SET sortIndex = ? WHERE project = ?;")
	if err != nil {
		return err
	}
	defer stmt.Close()

	for i, id := range ids {
		if _, err := stmt.Exec(i, id); err != nil {
			return err
		}
	}
	return tx.Commit()
}

// PinnedIDs returns the currently pinned project ids in pin order.
func (repo *ProjectRepo) PinnedIDs() ([]int, error) {
	rows, err := repo.DB.Query(
		"SELECT project FROM pinned_project ORDER BY sortIndex ASC, project ASC;",
	)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	ids := []int{}
	for rows.Next() {
		var id int
		if err := rows.Scan(&id); err != nil {
			return nil, err
		}
		ids = append(ids, id)
	}
	return ids, rows.Err()
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

// SwitchWorkflow moves this project's tasks off the old workflow's stages and
// onto the new workflow, then repoints project.workflow — all in one tx.
// Tasks whose stage is in `mappings` go to the mapped target; any remaining
// task still on an old-workflow stage falls back to fallbackStageId (the new
// workflow's open stage). Returns the number of tasks moved.
func (repo *ProjectRepo) SwitchWorkflow(
	projectId int,
	oldWorkflowId int,
	newWorkflowId int,
	fallbackStageId int,
	mappings map[int]int,
) (int, error) {
	tx, err := repo.DB.Begin()
	if err != nil {
		return 0, err
	}
	defer tx.Rollback()

	moved := 0

	mapStmt, err := tx.Prepare(
		"UPDATE task SET stage = ? WHERE stage = ?" +
			" AND checklist IN (SELECT id FROM checklist WHERE project = ?);",
	)
	if err != nil {
		return 0, err
	}
	defer mapStmt.Close()

	for fromId, toId := range mappings {
		res, err := mapStmt.Exec(toId, fromId, projectId)
		if err != nil {
			return 0, err
		}
		affected, err := res.RowsAffected()
		if err != nil {
			return 0, err
		}
		moved += int(affected)
	}

	// Catch-all: any task still pointing at an old-workflow stage (unmapped)
	// goes to the new workflow's open stage.
	res, err := tx.Exec(
		"UPDATE task SET stage = ?"+
			" WHERE checklist IN (SELECT id FROM checklist WHERE project = ?)"+
			" AND stage IN (SELECT id FROM stage WHERE workflow = ?);",
		fallbackStageId, projectId, oldWorkflowId,
	)
	if err != nil {
		return 0, err
	}
	affected, err := res.RowsAffected()
	if err != nil {
		return 0, err
	}
	moved += int(affected)

	if _, err := tx.Exec(
		"UPDATE project SET workflow = ? WHERE id = ?;",
		newWorkflowId, projectId,
	); err != nil {
		return 0, err
	}

	if err := tx.Commit(); err != nil {
		return 0, err
	}

	return moved, nil
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
