package services

import (
	"errors"

	"github.com/waseem-polus/aycorn/server/internal/models"
	"github.com/waseem-polus/aycorn/server/internal/models/repos"
)

type StageService struct {
	StageRepo *repos.StageRepo
}

var ErrInvalidStageType = errors.New("stage type must be one of: todo, doing, done, blocked")

var creatableStageTypes = map[string]struct{}{
	"todo":    {},
	"doing":   {},
	"done":    {},
	"blocked": {},
}

const defaultNewStageType = "doing"

func (s *StageService) CreateStage(workflowId int, stageType string) (*models.Stage, error) {
	if stageType == "" {
		stageType = defaultNewStageType
	}
	if _, ok := creatableStageTypes[stageType]; !ok {
		return nil, ErrInvalidStageType
	}

	defaults := repos.StageDefaults[stageType]

	maxPos, err := s.StageRepo.MaxPosition(workflowId)
	if err != nil {
		return nil, err
	}

	id, err := s.StageRepo.Create(&models.Stage{
		Workflow:    workflowId,
		Name:        "",
		Description: "",
		Color:       defaults.Color,
		Icon:        defaults.Icon,
		Position:    maxPos + 1,
		Type:        defaults.Type,
	})
	if err != nil {
		return nil, err
	}

	return s.StageRepo.FindOne(int(id))
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
