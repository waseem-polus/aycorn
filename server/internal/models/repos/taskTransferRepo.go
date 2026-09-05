package repos

import (
	"database/sql"
	"time"

	models "github.com/waseem-polus/aycorn/server/internal/models"
	"github.com/waseem-polus/aycorn/server/internal/timefmt"
)

// TransferDestination is a resolved copy/move target. A task's project is not a
// column — it is reached through checklist.project — so a destination checklist
// is what pins down both the project and (via project.workflow) the set of
// stages the moved tasks are allowed to sit on.
type TransferDestination struct {
	ChecklistID int
	ProjectID   int
	WorkflowID  int
}

// ResolveDestination turns a destination checklist id into the project and
// workflow it implies. sql.ErrNoRows when the checklist doesn't exist.
func (repo *TaskRepo) ResolveDestination(checklistId int) (*TransferDestination, error) {
	query := `
		SELECT c.id, c.project, p.workflow
		FROM checklist c
		INNER JOIN project p ON p.id = c.project
		WHERE c.id = ?;
	`

	dest := TransferDestination{}
	err := repo.DB.
		QueryRow(query, checklistId).
		Scan(&dest.ChecklistID, &dest.ProjectID, &dest.WorkflowID)
	if err != nil {
		return nil, err
	}

	return &dest, nil
}

// FindManyForTransfer loads the full rows a move/copy needs, body included.
// Mirrors FindOneWithProject's column list — nullable text columns are
// COALESCE'd because database/sql cannot scan NULL into a string.
func (repo *TaskRepo) FindManyForTransfer(ids []int) ([]models.TaskWithProject, error) {
	if len(ids) == 0 {
		return []models.TaskWithProject{}, nil
	}

	placeholders, args := intIdPlaceholders(ids)
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
		WHERE t.id IN (` + placeholders + `);
	`

	rows, err := repo.DB.Query(query, args...)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	tasks := []models.TaskWithProject{}
	for rows.Next() {
		t := models.TaskWithProject{}
		if err := rows.Scan(
			&t.ID,
			&t.Name,
			&t.Body,
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
			&t.Checklist,
			&t.ChecklistName,
			&t.ProjectID,
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

// MoveMany repoints tasks at a destination checklist in one statement. A nil
// stageId means every task keeps the stage it already has — valid only when the
// destination project shares the source workflow, which the service verifies.
//
// Nothing here clears timeCompleted: the task triggers already stamp it when a
// task lands on a `done` stage and clear it when it leaves one.
func (repo *TaskRepo) MoveMany(ids []int, checklistId int, stageId *int) (int, error) {
	if len(ids) == 0 {
		return 0, nil
	}

	placeholders, idArgs := intIdPlaceholders(ids)
	query := "UPDATE task SET checklist = ?"
	args := []any{checklistId}
	if stageId != nil {
		query += ", stage = ?"
		args = append(args, *stageId)
	}
	query += " WHERE id IN (" + placeholders + ");"
	args = append(args, idArgs...)

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

// CopyPlan is one source task resolved to where its copy should land. The
// service computes these so the repo stays free of the naming and
// completion-date rules.
type CopyPlan struct {
	Source      models.TaskWithProject
	Name        string
	ChecklistID int
	StageID     int
	// TimeCompleted is passed through explicitly rather than left NULL, because
	// the setTaskTimeCompletedOnDoneStage_Insert trigger only fires on NULL —
	// leaving it out would restamp a historical completion date to now.
	TimeCompleted *time.Time
}

// CopyMany inserts a copy of every planned task, and optionally re-creates each
// source's relationships against the new row. One transaction: SQLite is
// single-writer here (SetMaxOpenConns(1)) and a partially copied selection
// would be worse than none.
func (repo *TaskRepo) CopyMany(plans []CopyPlan, copyRelationships bool) ([]int, error) {
	if len(plans) == 0 {
		return []int{}, nil
	}

	tx, err := repo.DB.Begin()
	if err != nil {
		return nil, err
	}
	defer tx.Rollback()

	insert, err := tx.Prepare(`
		INSERT INTO task (name, body, checklist, stage, type, timePlannedStart, timePlannedEnd, hasTimePlannedStart, hasTimePlannedEnd, timeCompleted, assignee, priority)
		VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
	`)
	if err != nil {
		return nil, err
	}
	defer insert.Close()

	newIDs := make([]int, 0, len(plans))
	for _, plan := range plans {
		res, err := insert.Exec(
			plan.Name,
			plan.Source.Body,
			plan.ChecklistID,
			plan.StageID,
			plan.Source.Type.ID,
			timefmt.Format(plan.Source.TimePlannedStart),
			timefmt.Format(plan.Source.TimePlannedEnd),
			plan.Source.HasTimePlannedStart,
			plan.Source.HasTimePlannedEnd,
			timefmt.Format(plan.TimeCompleted),
			plan.Source.Assignee,
			plan.Source.Priority,
		)
		if err != nil {
			return nil, err
		}

		id, err := res.LastInsertId()
		if err != nil {
			return nil, err
		}
		newIDs = append(newIDs, int(id))

		if copyRelationships {
			if err := copyTaskRelationshipsInTx(tx, plan.Source.ID, id); err != nil {
				return nil, err
			}
		}
	}

	if err := tx.Commit(); err != nil {
		return nil, err
	}

	return newIDs, nil
}

// copyTaskRelationshipsInTx re-creates every relationship the source task takes
// part in, with the copy substituted for the source on its own side. The other
// end stays the original task even when it is also being copied — a copy links
// to what the original linked to. OR IGNORE covers the
// UNIQUE(fromTask, toTask, relationshipType) constraint.
func copyTaskRelationshipsInTx(tx *sql.Tx, sourceId int, newId int64) error {
	if _, err := tx.Exec(`
		INSERT OR IGNORE INTO task_relationship (fromTask, toTask, relationshipType)
		SELECT ?, toTask, relationshipType FROM task_relationship WHERE fromTask = ?;
	`, newId, sourceId); err != nil {
		return err
	}

	_, err := tx.Exec(`
		INSERT OR IGNORE INTO task_relationship (fromTask, toTask, relationshipType)
		SELECT fromTask, ?, relationshipType FROM task_relationship WHERE toTask = ?;
	`, newId, sourceId)
	return err
}
