package services

import (
	"github.com/waseem-polus/aycorn/server/internal/models"
	"github.com/waseem-polus/aycorn/server/internal/models/repos"
)

type TaskService struct {
	TaskRepo *repos.TaskRepo
}

func (s *TaskService) GetTaskBody(taskId int) (string, error) {
	taskBody, err := s.TaskRepo.GetTaskBody(taskId)
	if err != nil {
		return "[]", err
	}

	return taskBody, nil
}

func (s *TaskService) CreateChecklistTask(task *models.ChecklistTask) (*models.Task, error) {
	newTask, err := s.TaskRepo.CreateTask(task)
	if err != nil {
		return nil, err
	}

	return newTask, nil
}

func (s *TaskService) UpdateTask(updatedTask *models.ChecklistTask) (bool, error) {
	success, err := s.TaskRepo.UpdateTask(updatedTask)
	if err != nil {
		return false, err
	}

	return success, nil
}

func (s *TaskService) DeleteTask(taskId int) (bool, error) {
	success, err := s.TaskRepo.DeleteTask(taskId)
	if err != nil {
		return false, err
	}

	return success, nil
}
