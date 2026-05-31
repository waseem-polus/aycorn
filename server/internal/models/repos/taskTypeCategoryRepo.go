package repos

import (
	"database/sql"

	models "github.com/waseem-polus/aycorn/server/internal/models"
)

type TaskTypeCategoryRepo struct {
	DB *sql.DB
}

func (repo *TaskTypeCategoryRepo) All() ([]models.TaskTypeCategory, error) {
	rows, err := repo.DB.Query(
		"SELECT id, name, isDefault, sortOrder FROM task_type_category ORDER BY sortOrder ASC;",
	)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	categories := []models.TaskTypeCategory{}
	for rows.Next() {
		c := models.TaskTypeCategory{}
		if err := rows.Scan(&c.ID, &c.Name, &c.IsDefault, &c.SortOrder); err != nil {
			return nil, err
		}
		categories = append(categories, c)
	}
	return categories, rows.Err()
}

func (repo *TaskTypeCategoryRepo) FindOne(id int) (*models.TaskTypeCategory, error) {
	row := repo.DB.QueryRow(
		"SELECT id, name, isDefault, sortOrder FROM task_type_category WHERE id = ?;", id,
	)
	c := models.TaskTypeCategory{}
	if err := row.Scan(&c.ID, &c.Name, &c.IsDefault, &c.SortOrder); err != nil {
		return nil, err
	}
	return &c, nil
}

func (repo *TaskTypeCategoryRepo) DefaultID() (int, error) {
	var id int
	err := repo.DB.QueryRow(
		"SELECT id FROM task_type_category WHERE isDefault = 1 LIMIT 1;",
	).Scan(&id)
	return id, err
}

func (repo *TaskTypeCategoryRepo) MaxSortOrder() (int, error) {
	var max int
	err := repo.DB.QueryRow(
		"SELECT COALESCE(MAX(sortOrder), -1) FROM task_type_category;",
	).Scan(&max)
	return max, err
}

func (repo *TaskTypeCategoryRepo) Create(c *models.TaskTypeCategory) (*models.TaskTypeCategory, error) {
	var id int
	err := repo.DB.QueryRow(
		"INSERT INTO task_type_category (name, sortOrder) VALUES (?, ?) RETURNING id;",
		c.Name, c.SortOrder,
	).Scan(&id)
	if err != nil {
		return nil, err
	}
	return repo.FindOne(id)
}

func (repo *TaskTypeCategoryRepo) Update(c *models.TaskTypeCategory) (bool, error) {
	res, err := repo.DB.Exec(
		"UPDATE task_type_category SET name = ?, sortOrder = ? WHERE id = ?;",
		c.Name, c.SortOrder, c.ID,
	)
	if err != nil {
		return false, err
	}
	affected, err := res.RowsAffected()
	return affected > 0, err
}

func (repo *TaskTypeCategoryRepo) Delete(id int) error {
	_, err := repo.DB.Exec("DELETE FROM task_type_category WHERE id = ?;", id)
	return err
}

func (repo *TaskTypeCategoryRepo) Reorder(ids []int) error {
	tx, err := repo.DB.Begin()
	if err != nil {
		return err
	}
	defer tx.Rollback()

	for i, id := range ids {
		if _, err := tx.Exec(
			"UPDATE task_type_category SET sortOrder = ? WHERE id = ?;", i, id,
		); err != nil {
			return err
		}
	}
	return tx.Commit()
}

func (repo *TaskTypeCategoryRepo) ReassignTypes(fromCategoryID int, toCategoryID int) error {
	_, err := repo.DB.Exec(
		"UPDATE task_type SET category = ? WHERE category = ?;", toCategoryID, fromCategoryID,
	)
	return err
}
