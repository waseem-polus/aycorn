package services

import (
	"github.com/waseem-polus/aycorn/server/internal/models"
	"github.com/waseem-polus/aycorn/server/internal/models/repos"
)

type TaskService struct {
	TaskRepo *repos.TaskRepo
}

func (s *TaskService) CreateChecklistTask(newTask *models.ChecklistTask) (bool, error) {
	newTaskId, err := s.TaskRepo.CreateTask(newTask)
	if err != nil {
		return false, err
	}

	success, err := s.TaskRepo.CreateChecklistTask(newTask.Checklist, newTaskId)
	if err != nil {
		return false, err
	}

	return success > 0, nil
}

func (s *TaskService) UpdateTask(updatedTask *models.ChecklistTask) (bool, error) {
	success, err := s.TaskRepo.UpdateTask(updatedTask)
	if err != nil {
		return false, err
	}

	return success, nil
}
