package repos

import (
	"database/sql"

	models "github.com/waseem-polus/aycorn/server/internal/models"
)

type TaskRelationshipRepo struct {
	DB *sql.DB
}

const taskRelationshipTypeColumns = "id, fromName, toName, behavior, icon, color, isSystem"

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
	)
}

func (repo *TaskRelationshipRepo) AllTypes() ([]models.TaskRelationshipType, error) {
	query := "SELECT " + taskRelationshipTypeColumns + " FROM task_relationship_type ORDER BY id;"
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
