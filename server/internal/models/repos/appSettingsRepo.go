package repos

import (
	"database/sql"

	models "github.com/waseem-polus/aycorn/server/internal/models"
)

type AppSettingsRepo struct {
	DB *sql.DB
}

// Get reads the single settings row the migration creates.
func (repo *AppSettingsRepo) Get() (*models.AppSettings, error) {
	s := models.AppSettings{}
	err := repo.DB.QueryRow(
		"SELECT weekStartsOn FROM app_settings WHERE id = 1;",
	).Scan(&s.WeekStartsOn)
	if err != nil {
		return nil, err
	}
	return &s, nil
}

func (repo *AppSettingsRepo) Update(s *models.AppSettings) error {
	_, err := repo.DB.Exec(
		"UPDATE app_settings SET weekStartsOn = ? WHERE id = 1;", s.WeekStartsOn,
	)
	return err
}
