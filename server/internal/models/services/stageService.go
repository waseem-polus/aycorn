package services

import (
	"github.com/waseem-polus/aycorn/server/internal/models"
	"github.com/waseem-polus/aycorn/server/internal/models/repos"
)

type StageService struct {
	StageRepo *repos.StageRepo
}

func (s *StageService) UpdateStage(stage *models.Stage) (bool, error) {
	return s.StageRepo.Update(stage)
}

func (s *StageService) DeleteStage(id int) (bool, error) {
	return s.StageRepo.Delete(id)
}

func (s *StageService) ReorderStages(workflowId int, orderedStageIds []int) error {
	return s.StageRepo.Reorder(workflowId, orderedStageIds)
}
