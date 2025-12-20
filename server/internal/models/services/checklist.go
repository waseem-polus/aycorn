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

func (s *ChecklistService) GetChecklistsInProject(checklistId int) ([]models.ChecklistDetails, error) {
	checklists, err := s.ChecklistRepo.InProject(checklistId)
	if err != nil {
		return nil, err
	}

	return checklists, nil
}
