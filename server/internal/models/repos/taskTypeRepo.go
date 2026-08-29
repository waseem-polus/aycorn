package repos

import (
	"database/sql"
	"strings"

	models "github.com/waseem-polus/aycorn/server/internal/models"
)

type TaskTypeRepo struct {
	DB *sql.DB
}

const taskTypeColumns = "id, name, COALESCE(description, ''), icon, color, isDefault, category"

func scanTaskType(scanner interface{ Scan(...any) error }, tt *models.TaskType) error {
	return scanner.Scan(&tt.ID, &tt.Name, &tt.Description, &tt.Icon, &tt.Color, &tt.IsDefault, &tt.Category)
}

func (repo *TaskTypeRepo) All() ([]models.TaskType, error) {
	query := "SELECT " + taskTypeColumns + " FROM task_type ORDER BY isDefault DESC, id ASC;"
	rows, err := repo.DB.Query(query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	types := []models.TaskType{}
	for rows.Next() {
		tt := models.TaskType{}
		if err := scanTaskType(rows, &tt); err != nil {
			return nil, err
		}
		types = append(types, tt)
	}
	return types, rows.Err()
}

// AllWithCounts reports each type alongside how widely it is actually used:
// projectCount is the number of distinct projects holding a task of that type.
// The filter narrows to types that do ("in-use") or do not ("unused") have any
// tasks at all.
func (repo *TaskTypeRepo) AllWithCounts(filter string) ([]models.TaskTypeGlobal, error) {
	query := `
		SELECT
			` + taskTypeColumns + `,
			(SELECT COUNT(DISTINCT c.project)
			   FROM task t
			   INNER JOIN checklist c ON c.id = t.checklist
			  WHERE t.type = tt.id) AS projectCount,
			(SELECT COUNT(*) FROM task t WHERE t.type = tt.id) AS taskCount
		FROM task_type tt
	`
	switch filter {
	case "in-use":
		query += "WHERE EXISTS (SELECT 1 FROM task t WHERE t.type = tt.id)\n"
	case "unused":
		query += "WHERE NOT EXISTS (SELECT 1 FROM task t WHERE t.type = tt.id)\n"
	}
	query += "ORDER BY tt.isDefault DESC, tt.id ASC;"

	rows, err := repo.DB.Query(query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	types := []models.TaskTypeGlobal{}
	for rows.Next() {
		g := models.TaskTypeGlobal{}
		if err := rows.Scan(
			&g.ID, &g.Name, &g.Description, &g.Icon, &g.Color, &g.IsDefault, &g.Category,
			&g.ProjectCount, &g.TaskCount,
		); err != nil {
			return nil, err
		}
		types = append(types, g)
	}
	return types, rows.Err()
}

// InUseForProject lists the types that at least one task in the project is
// already using. Types are globally available, so this is not a permission
// check — it is what powers the project's type filters, which would otherwise
// offer options that match nothing.
func (repo *TaskTypeRepo) InUseForProject(projectId int) ([]models.TaskType, error) {
	query := `
		SELECT ` + taskTypeColumns + `
		FROM task_type tt
		WHERE EXISTS (
			SELECT 1 FROM task t
			INNER JOIN checklist c ON c.id = t.checklist
			WHERE t.type = tt.id AND c.project = ?
		)
		ORDER BY tt.isDefault DESC, tt.name ASC;
	`
	rows, err := repo.DB.Query(query, projectId)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	types := []models.TaskType{}
	for rows.Next() {
		tt := models.TaskType{}
		if err := scanTaskType(rows, &tt); err != nil {
			return nil, err
		}
		types = append(types, tt)
	}
	return types, rows.Err()
}

func (repo *TaskTypeRepo) FindOne(id int) (*models.TaskType, error) {
	query := "SELECT " + taskTypeColumns + " FROM task_type WHERE id = ?;"
	row := repo.DB.QueryRow(query, id)
	tt := models.TaskType{}
	if err := scanTaskType(row, &tt); err != nil {
		return nil, err
	}
	return &tt, nil
}

func (repo *TaskTypeRepo) DefaultTypeID() (int, error) {
	var id int
	err := repo.DB.QueryRow("SELECT id FROM task_type WHERE isDefault = 1 LIMIT 1;").Scan(&id)
	return id, err
}

func (repo *TaskTypeRepo) Create(tt *models.TaskType) (*models.TaskType, error) {
	query := `
		INSERT INTO task_type (name, description, icon, color, category)
		VALUES (?, ?, ?, ?, ?)
		RETURNING id;
	`
	var id int
	err := repo.DB.QueryRow(query, tt.Name, tt.Description, tt.Icon, tt.Color, tt.Category).Scan(&id)
	if err != nil {
		return nil, err
	}
	return repo.FindOne(id)
}

func (repo *TaskTypeRepo) Update(tt *models.TaskType) (bool, error) {
	query := `
		UPDATE task_type SET name = ?, description = ?, icon = ?, color = ?, category = ?
		WHERE id = ?;
	`
	res, err := repo.DB.Exec(query, tt.Name, tt.Description, tt.Icon, tt.Color, tt.Category, tt.ID)
	if err != nil {
		return false, err
	}
	affected, err := res.RowsAffected()
	return affected > 0, err
}

func (repo *TaskTypeRepo) TransferAndDelete(id int, transferToID int) error {
	tx, err := repo.DB.Begin()
	if err != nil {
		return err
	}
	defer tx.Rollback()

	if _, err := tx.Exec("UPDATE task SET type = ? WHERE type = ?;", transferToID, id); err != nil {
		return err
	}
	if _, err := tx.Exec("DELETE FROM task_type WHERE id = ?;", id); err != nil {
		return err
	}
	return tx.Commit()
}

func (repo *TaskTypeRepo) UpdateManyFields(ids []int, fields map[string]any) (int, error) {
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
	query := "UPDATE task_type SET " + strings.Join(setParts, ", ") +
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

// BulkTransferAndDelete moves the tasks of each deleted type to its mapped
// destination, then deletes the types in one transaction. Default types are
// never deleted (the WHERE clause excludes them).
func (repo *TaskTypeRepo) BulkTransferAndDelete(ids []int, mappings map[int]int) (int, error) {
	if len(ids) == 0 {
		return 0, nil
	}
	tx, err := repo.DB.Begin()
	if err != nil {
		return 0, err
	}
	defer tx.Rollback()

	stmt, err := tx.Prepare("UPDATE task SET type = ? WHERE type = ?;")
	if err != nil {
		return 0, err
	}
	for fromID, toID := range mappings {
		if _, err := stmt.Exec(toID, fromID); err != nil {
			stmt.Close()
			return 0, err
		}
	}
	stmt.Close()

	placeholders, args := intIdPlaceholders(ids)
	query := "DELETE FROM task_type WHERE id IN (" + placeholders + ") AND isDefault = 0;"
	res, err := tx.Exec(query, args...)
	if err != nil {
		return 0, err
	}
	affected, err := res.RowsAffected()
	if err != nil {
		return 0, err
	}

	if err := tx.Commit(); err != nil {
		return 0, err
	}
	return int(affected), nil
}
