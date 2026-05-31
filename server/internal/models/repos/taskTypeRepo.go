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

func (repo *TaskTypeRepo) AllWithCounts() ([]models.TaskTypeGlobal, error) {
	query := `
		SELECT
			` + taskTypeColumns + `,
			(SELECT COUNT(DISTINCT ptt.project) FROM project_task_type ptt WHERE ptt.task_type = tt.id) AS projectCount,
			(SELECT COUNT(*) FROM task t WHERE t.type = tt.id) AS taskCount
		FROM task_type tt
		ORDER BY tt.isDefault DESC, tt.id ASC;
	`
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

func (repo *TaskTypeRepo) AllWithProjectTaskCounts(projectId int) ([]models.TaskTypeWithCount, error) {
	query := `
		SELECT
			` + taskTypeColumns + `,
			(SELECT COUNT(*) FROM task t INNER JOIN checklist c ON c.id = t.checklist WHERE t.type = tt.id AND c.project = ?) AS taskCount
		FROM task_type tt
		ORDER BY tt.isDefault DESC, tt.id ASC;
	`
	rows, err := repo.DB.Query(query, projectId)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	types := []models.TaskTypeWithCount{}
	for rows.Next() {
		tc := models.TaskTypeWithCount{}
		if err := rows.Scan(
			&tc.ID, &tc.Name, &tc.Description, &tc.Icon, &tc.Color, &tc.IsDefault, &tc.Category,
			&tc.TaskCount,
		); err != nil {
			return nil, err
		}
		types = append(types, tc)
	}
	return types, rows.Err()
}

func (repo *TaskTypeRepo) EnabledForProject(projectId int) ([]models.TaskType, error) {
	query := `
		SELECT ` + taskTypeColumns + `
		FROM task_type tt
		INNER JOIN project_task_type ptt ON ptt.task_type = tt.id
		WHERE ptt.project = ?
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

func (repo *TaskTypeRepo) EnabledIDsForProject(projectId int) ([]int, error) {
	query := "SELECT task_type FROM project_task_type WHERE project = ?;"
	rows, err := repo.DB.Query(query, projectId)
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

func (repo *TaskTypeRepo) SetEnabledForProject(projectId int, enabledIDs []int) error {
	tx, err := repo.DB.Begin()
	if err != nil {
		return err
	}
	defer tx.Rollback()

	// Delete all existing enabled types for this project.
	if _, err := tx.Exec("DELETE FROM project_task_type WHERE project = ?;", projectId); err != nil {
		return err
	}

	if len(enabledIDs) > 0 {
		placeholders := strings.TrimRight(strings.Repeat("(?,?),", len(enabledIDs)), ",")
		args := make([]any, 0, len(enabledIDs)*2)
		for _, typeID := range enabledIDs {
			args = append(args, projectId, typeID)
		}
		if _, err := tx.Exec("INSERT INTO project_task_type (project, task_type) VALUES "+placeholders+";", args...); err != nil {
			return err
		}
	}

	return tx.Commit()
}

func (repo *TaskTypeRepo) IDsByCategory(categoryID int) ([]int, error) {
	rows, err := repo.DB.Query("SELECT id FROM task_type WHERE category = ?;", categoryID)
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

func (repo *TaskTypeRepo) AddDefaultTypeToProject(projectId int) error {
	_, err := repo.DB.Exec(`
		INSERT OR IGNORE INTO project_task_type (project, task_type)
		SELECT ?, id FROM task_type WHERE isDefault = 1;
	`, projectId)
	return err
}
