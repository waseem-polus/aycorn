package services

import (
	"errors"
	"strings"

	models "github.com/waseem-polus/aycorn/server/internal/models"
	"github.com/waseem-polus/aycorn/server/internal/models/repos"
)

var ErrDuplicateRelationship = errors.New("a relationship of this type already exists between these tasks")

type TaskRelationshipService struct {
	TaskRelationshipRepo *repos.TaskRelationshipRepo
}

func (s *TaskRelationshipService) GetRelationshipTypes() ([]models.TaskRelationshipType, error) {
	return s.TaskRelationshipRepo.AllTypes()
}

func (s *TaskRelationshipService) GetTaskRelationships(taskId int) ([]models.TaskRelationship, error) {
	return s.TaskRelationshipRepo.ForTask(taskId)
}

func (s *TaskRelationshipService) DeleteRelationship(id int) error {
	return s.TaskRelationshipRepo.Delete(id)
}

func (s *TaskRelationshipService) CreateRelationship(fromTaskID, toTaskID, typeID int) error {
	err := s.TaskRelationshipRepo.Create(fromTaskID, toTaskID, typeID)
	if err != nil && strings.Contains(err.Error(), "UNIQUE constraint failed") {
		return ErrDuplicateRelationship
	}
	return err
}
