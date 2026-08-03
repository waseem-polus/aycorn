package repos

import (
	"database/sql"

	models "github.com/waseem-polus/aycorn/server/internal/models"
)

type ProjectFolderRepo struct {
	DB *sql.DB
}

func (repo *ProjectFolderRepo) All() ([]models.ProjectFolder, error) {
	rows, err := repo.DB.Query(
		"SELECT id, name, isDefault, sortOrder FROM project_folder ORDER BY sortOrder ASC;",
	)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	folders := []models.ProjectFolder{}
	for rows.Next() {
		f := models.ProjectFolder{}
		if err := rows.Scan(&f.ID, &f.Name, &f.IsDefault, &f.SortOrder); err != nil {
			return nil, err
		}
		folders = append(folders, f)
	}
	return folders, rows.Err()
}

func (repo *ProjectFolderRepo) FindOne(id int) (*models.ProjectFolder, error) {
	row := repo.DB.QueryRow(
		"SELECT id, name, isDefault, sortOrder FROM project_folder WHERE id = ?;", id,
	)
	f := models.ProjectFolder{}
	if err := row.Scan(&f.ID, &f.Name, &f.IsDefault, &f.SortOrder); err != nil {
		return nil, err
	}
	return &f, nil
}

func (repo *ProjectFolderRepo) DefaultID() (int, error) {
	var id int
	err := repo.DB.QueryRow(
		"SELECT id FROM project_folder WHERE isDefault = 1 LIMIT 1;",
	).Scan(&id)
	return id, err
}

func (repo *ProjectFolderRepo) MaxSortOrder() (int, error) {
	var max int
	err := repo.DB.QueryRow(
		"SELECT COALESCE(MAX(sortOrder), -1) FROM project_folder;",
	).Scan(&max)
	return max, err
}

func (repo *ProjectFolderRepo) Create(f *models.ProjectFolder) (*models.ProjectFolder, error) {
	var id int
	err := repo.DB.QueryRow(
		"INSERT INTO project_folder (name, sortOrder) VALUES (?, ?) RETURNING id;",
		f.Name, f.SortOrder,
	).Scan(&id)
	if err != nil {
		return nil, err
	}
	return repo.FindOne(id)
}

func (repo *ProjectFolderRepo) Update(f *models.ProjectFolder) (bool, error) {
	res, err := repo.DB.Exec(
		"UPDATE project_folder SET name = ?, sortOrder = ? WHERE id = ?;",
		f.Name, f.SortOrder, f.ID,
	)
	if err != nil {
		return false, err
	}
	affected, err := res.RowsAffected()
	return affected > 0, err
}

func (repo *ProjectFolderRepo) Delete(id int) error {
	_, err := repo.DB.Exec("DELETE FROM project_folder WHERE id = ?;", id)
	return err
}

func (repo *ProjectFolderRepo) Reorder(ids []int) error {
	tx, err := repo.DB.Begin()
	if err != nil {
		return err
	}
	defer tx.Rollback()

	for i, id := range ids {
		if _, err := tx.Exec(
			"UPDATE project_folder SET sortOrder = ? WHERE id = ?;", i, id,
		); err != nil {
			return err
		}
	}
	return tx.Commit()
}

func (repo *ProjectFolderRepo) ReassignProjects(fromFolderID int, toFolderID int) error {
	_, err := repo.DB.Exec(
		"UPDATE project SET folder = ? WHERE folder = ?;", toFolderID, fromFolderID,
	)
	return err
}
