package services

import (
	models "github.com/waseem-polus/aycorn/server/internal/models"
	"github.com/waseem-polus/aycorn/server/internal/models/repos"
)

type TaskRelationshipService struct {
	TaskRelationshipRepo *repos.TaskRelationshipRepo
}

func (s *TaskRelationshipService) GetRelationshipTypes() ([]models.TaskRelationshipType, error) {
	return s.TaskRelationshipRepo.AllTypes()
}

func (s *TaskRelationshipService) GetTaskRelationships(taskId int) ([]models.TaskRelationship, error) {
	return s.TaskRelationshipRepo.ForTask(taskId)
}
