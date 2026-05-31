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
	CategoryRepo *repos.TaskTypeCategoryRepo
}

func (s *TaskTypeService) GetAll() ([]models.TaskTypeGlobal, error) {
	return s.TaskTypeRepo.AllWithCounts()
}

func (s *TaskTypeService) GetEnabledForProject(projectId int) ([]models.TaskType, error) {
	return s.TaskTypeRepo.EnabledForProject(projectId)
}

func (s *TaskTypeService) GetProjectSettings(projectId int) (*models.ProjectTaskTypeSettings, error) {
	allTypes, err := s.TaskTypeRepo.AllWithProjectTaskCounts(projectId)
	if err != nil {
		return nil, err
	}

	enabledIDs, err := s.TaskTypeRepo.EnabledIDsForProject(projectId)
	if err != nil {
		return nil, err
	}

	categories, err := s.CategoryRepo.All()
	if err != nil {
		return nil, err
	}

	return &models.ProjectTaskTypeSettings{
		AllTypes:       allTypes,
		EnabledTypeIDs: enabledIDs,
		Categories:     categories,
	}, nil
}

func (s *TaskTypeService) ensureDefaultIncluded(enabledIDs []int) ([]int, error) {
	defaultID, err := s.TaskTypeRepo.DefaultTypeID()
	if err != nil {
		return nil, err
	}
	for _, id := range enabledIDs {
		if id == defaultID {
			return enabledIDs, nil
		}
	}
	return append(enabledIDs, defaultID), nil
}

func (s *TaskTypeService) SetProjectTypes(projectId int, enabledIDs []int) error {
	ids, err := s.ensureDefaultIncluded(enabledIDs)
	if err != nil {
		return err
	}
	return s.TaskTypeRepo.SetEnabledForProject(projectId, ids)
}

func (s *TaskTypeService) SetProjectTypesWithRoute(projectId int, enabledIDs []int, fromTypeID int, toTypeID int) error {
	ids, err := s.ensureDefaultIncluded(enabledIDs)
	if err != nil {
		return err
	}
	return s.TaskTypeRepo.SetEnabledForProjectWithRoute(projectId, ids, fromTypeID, toTypeID)
}

func (s *TaskTypeService) Create(tt *models.TaskType) (*models.TaskType, error) {
	if tt.Icon == "" {
		tt.Icon = "square-check"
	}
	if tt.Color == "" {
		tt.Color = "gray"
	}
	if tt.Category == 0 {
		defaultID, err := s.CategoryRepo.DefaultID()
		if err != nil {
			return nil, err
		}
		tt.Category = defaultID
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
