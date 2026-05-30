package services

import (
	"errors"

	"github.com/waseem-polus/aycorn/server/internal/models"
	"github.com/waseem-polus/aycorn/server/internal/models/repos"
)

var ErrDefaultTaskType = errors.New("the default task type cannot be deleted")
var ErrTransferTypeRequired = errors.New("a transfer type is required when deleting a type that has tasks")

type TaskTypeService struct {
	TaskTypeRepo *repos.TaskTypeRepo
}

func (s *TaskTypeService) GetAll() ([]models.TaskTypeGlobal, error) {
	return s.TaskTypeRepo.AllWithCounts()
}

func (s *TaskTypeService) GetEnabledForProject(projectId int) ([]models.TaskType, error) {
	return s.TaskTypeRepo.EnabledForProject(projectId)
}

func (s *TaskTypeService) GetProjectSettings(projectId int) (*models.ProjectTaskTypeSettings, error) {
	allTypes, err := s.TaskTypeRepo.All()
	if err != nil {
		return nil, err
	}

	enabledIDs, err := s.TaskTypeRepo.EnabledIDsForProject(projectId)
	if err != nil {
		return nil, err
	}

	return &models.ProjectTaskTypeSettings{
		AllTypes:       allTypes,
		EnabledTypeIDs: enabledIDs,
	}, nil
}

func (s *TaskTypeService) SetProjectTypes(projectId int, enabledIDs []int) error {
	// Always include the default type even if the caller omitted it.
	defaultID, err := s.TaskTypeRepo.DefaultTypeID()
	if err != nil {
		return err
	}

	hasDefault := false
	for _, id := range enabledIDs {
		if id == defaultID {
			hasDefault = true
			break
		}
	}
	if !hasDefault {
		enabledIDs = append(enabledIDs, defaultID)
	}

	return s.TaskTypeRepo.SetEnabledForProject(projectId, enabledIDs)
}

func (s *TaskTypeService) Create(tt *models.TaskType) (*models.TaskType, error) {
	if tt.Name == "" {
		tt.Name = "Untitled"
	}
	if tt.Icon == "" {
		tt.Icon = "square-check"
	}
	if tt.Color == "" {
		tt.Color = "gray"
	}
	return s.TaskTypeRepo.Create(tt)
}

func (s *TaskTypeService) Update(tt *models.TaskType) (bool, error) {
	return s.TaskTypeRepo.Update(tt)
}

func (s *TaskTypeService) Delete(id int, transferToID int) error {
	existing, err := s.TaskTypeRepo.FindOne(id)
	if err != nil {
		return err
	}
	if existing.IsDefault {
		return ErrDefaultTaskType
	}

	return s.TaskTypeRepo.TransferAndDelete(id, transferToID)
}
