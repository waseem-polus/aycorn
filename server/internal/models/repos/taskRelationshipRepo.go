package repos

import (
	"database/sql"

	models "github.com/waseem-polus/aycorn/server/internal/models"
)

type TaskRelationshipRepo struct {
	DB *sql.DB
}

func scanTaskRelationshipType(scanner interface {
	Scan(...any) error
}, t *models.TaskRelationshipType) error {
	return scanner.Scan(
		&t.ID,
		&t.FromName,
		&t.ToName,
		&t.Behavior,
		&t.Icon,
		&t.Color,
		&t.IsSystem,
		&t.UsageCount,
	)
}

func (repo *TaskRelationshipRepo) AllTypes() ([]models.TaskRelationshipType, error) {
	query := `
		SELECT trt.id, trt.fromName, trt.toName, trt.behavior, trt.icon, trt.color, trt.isSystem,
		       COUNT(tr.id) as usageCount
		  FROM task_relationship_type trt
		  LEFT JOIN task_relationship tr ON tr.relationshipType = trt.id
		 GROUP BY trt.id
		 ORDER BY trt.id;
	`
	rows, err := repo.DB.Query(query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	types := []models.TaskRelationshipType{}
	for rows.Next() {
		t := models.TaskRelationshipType{}
		if err := scanTaskRelationshipType(rows, &t); err != nil {
			return nil, err
		}
		types = append(types, t)
	}

	return types, rows.Err()
}

// ForTask returns every relationship involving taskId, summarized from that
// task's perspective: Direction tells whether the queried task is the "from" or
// "to" side, and Other describes the task on the opposite side.
func (repo *TaskRelationshipRepo) ForTask(taskId int) ([]models.TaskRelationship, error) {
	query := `
		SELECT tr.id,
		       CASE WHEN tr.fromTask = ? THEN 'from' ELSE 'to' END,
		       trt.id, trt.fromName, trt.toName, trt.behavior, trt.icon, trt.color, trt.isSystem,
		       ot.id, COALESCE(ot.name, ''), c.project, p.name, c.name,
		       COALESCE(ot.priority, ''), (s.type = 'done'),
		       s.id, s.workflow, s.name, COALESCE(s.description, ''), s.color, s.icon, s.position, s.type,
		       tt.id, tt.name, COALESCE(tt.description, ''), tt.icon, tt.color, tt.isDefault
		  FROM task_relationship tr
		  JOIN task_relationship_type trt ON trt.id = tr.relationshipType
		  JOIN task ot ON ot.id = CASE WHEN tr.fromTask = ? THEN tr.toTask ELSE tr.fromTask END
		  JOIN checklist c ON c.id = ot.checklist
		  JOIN project p ON p.id = c.project
		  JOIN stage s ON s.id = ot.stage
		  JOIN task_type tt ON tt.id = ot.type
		 WHERE tr.fromTask = ? OR tr.toTask = ?
		 ORDER BY tr.id;
	`
	rows, err := repo.DB.Query(query, taskId, taskId, taskId, taskId)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	relationships := []models.TaskRelationship{}
	for rows.Next() {
		r := models.TaskRelationship{}
		if err := rows.Scan(
			&r.ID,
			&r.Direction,
			&r.Type.ID,
			&r.Type.FromName,
			&r.Type.ToName,
			&r.Type.Behavior,
			&r.Type.Icon,
			&r.Type.Color,
			&r.Type.IsSystem,
			&r.Other.ID,
			&r.Other.Name,
			&r.Other.ProjectID,
			&r.Other.ProjectName,
			&r.Other.ChecklistName,
			&r.Other.Priority,
			&r.Other.IsDone,
			&r.Other.Stage.ID,
			&r.Other.Stage.Workflow,
			&r.Other.Stage.Name,
			&r.Other.Stage.Description,
			&r.Other.Stage.Color,
			&r.Other.Stage.Icon,
			&r.Other.Stage.Position,
			&r.Other.Stage.Type,
			&r.Other.Type.ID,
			&r.Other.Type.Name,
			&r.Other.Type.Description,
			&r.Other.Type.Icon,
			&r.Other.Type.Color,
			&r.Other.Type.IsDefault,
		); err != nil {
			return nil, err
		}
		relationships = append(relationships, r)
	}

	return relationships, rows.Err()
}

func (repo *TaskRelationshipRepo) CreateType(fromName, toName, behavior, icon, color string) (int, error) {
	res, err := repo.DB.Exec(
		`INSERT INTO task_relationship_type (fromName, toName, behavior, icon, color) VALUES (?, ?, ?, ?, ?)`,
		fromName, toName, behavior, icon, color,
	)
	if err != nil {
		return 0, err
	}
	id, err := res.LastInsertId()
	return int(id), err
}

func (repo *TaskRelationshipRepo) UpdateType(id int, fromName, toName, behavior, icon, color string) error {
	res, err := repo.DB.Exec(
		`UPDATE task_relationship_type SET fromName=?, toName=?, behavior=?, icon=?, color=? WHERE id=? AND isSystem=0`,
		fromName, toName, behavior, icon, color, id,
	)
	if err != nil {
		return err
	}
	n, err := res.RowsAffected()
	if err != nil {
		return err
	}
	if n == 0 {
		return sql.ErrNoRows
	}
	return nil
}

func (repo *TaskRelationshipRepo) UpdateTypeIcon(id int, icon string) error {
	res, err := repo.DB.Exec(
		`UPDATE task_relationship_type SET icon=? WHERE id=?`,
		icon, id,
	)
	if err != nil {
		return err
	}
	n, err := res.RowsAffected()
	if err != nil {
		return err
	}
	if n == 0 {
		return sql.ErrNoRows
	}
	return nil
}

func (repo *TaskRelationshipRepo) UpdateTypeNames(id int, fromName, toName string) error {
	res, err := repo.DB.Exec(
		`UPDATE task_relationship_type SET fromName=?, toName=? WHERE id=? AND isSystem=0`,
		fromName, toName, id,
	)
	if err != nil {
		return err
	}
	n, err := res.RowsAffected()
	if err != nil {
		return err
	}
	if n == 0 {
		return sql.ErrNoRows
	}
	return nil
}

func (repo *TaskRelationshipRepo) DeleteType(id int) error {
	tx, err := repo.DB.Begin()
	if err != nil {
		return err
	}
	defer tx.Rollback()

	// Cascade-delete relationships first (FK is RESTRICT, not CASCADE)
	if _, err := tx.Exec(`DELETE FROM task_relationship WHERE relationshipType=?`, id); err != nil {
		return err
	}

	res, err := tx.Exec(`DELETE FROM task_relationship_type WHERE id=? AND isSystem=0`, id)
	if err != nil {
		return err
	}
	n, err := res.RowsAffected()
	if err != nil {
		return err
	}
	if n == 0 {
		return sql.ErrNoRows
	}

	return tx.Commit()
}

func (repo *TaskRelationshipRepo) Create(fromTaskID, toTaskID, typeID int) error {
	_, err := repo.DB.Exec(
		`INSERT INTO task_relationship (fromTask, toTask, relationshipType) VALUES (?, ?, ?)`,
		fromTaskID, toTaskID, typeID,
	)
	return err
}

func (repo *TaskRelationshipRepo) Delete(id int) error {
	res, err := repo.DB.Exec(`DELETE FROM task_relationship WHERE id = ?`, id)
	if err != nil {
		return err
	}
	n, err := res.RowsAffected()
	if err != nil {
		return err
	}
	if n == 0 {
		return sql.ErrNoRows
	}
	return nil
}
