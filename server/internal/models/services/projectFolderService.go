package services

import (
	"database/sql"
	"errors"

	"github.com/waseem-polus/aycorn/server/internal/models"
	"github.com/waseem-polus/aycorn/server/internal/models/repos"
)

var (
	ErrDefaultProjectFolder = errors.New("the default project folder cannot be deleted")
	// ErrInvalidTransferFolder means the folder still holds projects and the
	// transfer target is missing, nonexistent, or the folder being deleted.
	ErrInvalidTransferFolder = errors.New("a different, existing folder is required to move this folder's projects to")
)

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

	count, err := s.FolderRepo.CountProjects(id)
	if err != nil {
		return err
	}
	if count == 0 {
		return s.FolderRepo.DeleteAndReassign(id, 0)
	}

	if transferFolderID == 0 || transferFolderID == id {
		return ErrInvalidTransferFolder
	}
	if _, err := s.FolderRepo.FindOne(transferFolderID); err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return ErrInvalidTransferFolder
		}
		return err
	}
	return s.FolderRepo.DeleteAndReassign(id, transferFolderID)
}

func (s *ProjectFolderService) Reorder(ids []int) error {
	return s.FolderRepo.Reorder(ids)
}
