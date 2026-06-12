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

func (s *ChecklistService) CreateChecklist(projectId int, name string) (*models.Checklist, error) {
	checklist, err := s.ChecklistRepo.CreateChecklist(projectId, name)
	if err != nil {
		return nil, err
	}

	return checklist, nil
}

func (s *ChecklistService) UpdateChecklist(checklist *models.Checklist) (bool, error) {
	success, err := s.ChecklistRepo.UpdateChecklist(checklist)
	if err != nil {
		return false, err
	}

	return success, nil
}

func (s *ChecklistService) DeleteChecklist(checklistId int) (bool, error) {
	success, err := s.ChecklistRepo.DeleteChecklist(checklistId)
	if err != nil {
		return false, err
	}

	return success, nil
}
