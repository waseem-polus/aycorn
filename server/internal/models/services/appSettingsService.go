package services

import (
	"errors"

	"github.com/waseem-polus/aycorn/server/internal/models"
	"github.com/waseem-polus/aycorn/server/internal/models/repos"
)

var ErrInvalidSettings = errors.New("invalid settings")

type AppSettingsService struct {
	SettingsRepo *repos.AppSettingsRepo
}

func (s *AppSettingsService) Get() (*models.AppSettings, error) {
	return s.SettingsRepo.Get()
}

func (s *AppSettingsService) Update(settings *models.AppSettings) (*models.AppSettings, error) {
	if settings.WeekStartsOn != 0 && settings.WeekStartsOn != 1 {
		return nil, ErrInvalidSettings
	}
	if err := s.SettingsRepo.Update(settings); err != nil {
		return nil, err
	}
	return s.SettingsRepo.Get()
}
