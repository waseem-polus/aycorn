package services

import (
	"github.com/waseem-polus/aycorn/server/internal/models"
	"github.com/waseem-polus/aycorn/server/internal/models/repos"
)

type ChecklistService struct {
	ChecklistRepo *repos.ChecklistRepo
	TaskRepo      *repos.TaskRepo
}

type ChecklistDetails struct {
	Checklist *models.Checklist
	Tasks     []models.Task
}

func (s *ChecklistService) GetChecklistDetails(checklistId int) (*ChecklistDetails, error) {
	checklist, err := s.ChecklistRepo.FindOne(checklistId)
	if err != nil {
		return nil, err
	}

	tasks, err := s.TaskRepo.InChecklist(checklistId)
	if err != nil {
		return nil, err
	}

	return &ChecklistDetails{
		Checklist: checklist,
		Tasks:     tasks,
	}, nil
}
