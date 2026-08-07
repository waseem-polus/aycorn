package services

import (
	"errors"

	"github.com/waseem-polus/aycorn/server/internal/models"
	"github.com/waseem-polus/aycorn/server/internal/models/repos"
)

var ErrDefaultProjectFolder = errors.New("the default project folder cannot be deleted")

type ProjectFolderService struct {
	FolderRepo *repos.ProjectFolderRepo
}

func (s *ProjectFolderService) GetAll() ([]models.ProjectFolder, error) {
	return s.FolderRepo.All()
}

// Create makes an empty, unnamed folder at the end of the list — the user names
// it in place rather than filling in a form first.
func (s *ProjectFolderService) Create() (*models.ProjectFolder, error) {
	max, err := s.FolderRepo.MaxSortOrder()
	if err != nil {
		return nil, err
	}
	return s.FolderRepo.Create(&models.ProjectFolder{
		Name:      "",
		SortOrder: max + 1,
	})
}

func (s *ProjectFolderService) Update(id int, name string) (bool, error) {
	existing, err := s.FolderRepo.FindOne(id)
	if err != nil {
		return false, err
	}
	existing.Name = name
	return s.FolderRepo.Update(existing)
}

func (s *ProjectFolderService) Delete(id int, transferFolderID int) error {
	existing, err := s.FolderRepo.FindOne(id)
	if err != nil {
		return err
	}
	if existing.IsDefault {
		return ErrDefaultProjectFolder
	}

	if err := s.FolderRepo.ReassignProjects(id, transferFolderID); err != nil {
		return err
	}
	return s.FolderRepo.Delete(id)
}

func (s *ProjectFolderService) Reorder(ids []int) error {
	return s.FolderRepo.Reorder(ids)
}
