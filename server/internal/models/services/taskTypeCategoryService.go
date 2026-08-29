package services

import (
	"errors"

	"github.com/waseem-polus/aycorn/server/internal/models"
	"github.com/waseem-polus/aycorn/server/internal/models/repos"
)

var ErrDefaultTaskTypeCategory = errors.New("the default task type category cannot be deleted")

type TaskTypeCategoryService struct {
	CategoryRepo *repos.TaskTypeCategoryRepo
}

func (s *TaskTypeCategoryService) GetAll() ([]models.TaskTypeCategory, error) {
	return s.CategoryRepo.All()
}

func (s *TaskTypeCategoryService) Create() (*models.TaskTypeCategory, error) {
	max, err := s.CategoryRepo.MaxSortOrder()
	if err != nil {
		return nil, err
	}
	return s.CategoryRepo.Create(&models.TaskTypeCategory{
		Name:      "",
		SortOrder: max + 1,
	})
}

func (s *TaskTypeCategoryService) Update(id int, name string) (bool, error) {
	existing, err := s.CategoryRepo.FindOne(id)
	if err != nil {
		return false, err
	}
	existing.Name = name
	return s.CategoryRepo.Update(existing)
}

func (s *TaskTypeCategoryService) Delete(id int, transferCategoryID int) error {
	existing, err := s.CategoryRepo.FindOne(id)
	if err != nil {
		return err
	}
	if existing.IsDefault {
		return ErrDefaultTaskTypeCategory
	}

	if err := s.CategoryRepo.ReassignTypes(id, transferCategoryID); err != nil {
		return err
	}
	return s.CategoryRepo.Delete(id)
}

func (s *TaskTypeCategoryService) Reorder(ids []int) error {
	return s.CategoryRepo.Reorder(ids)
}
