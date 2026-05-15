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

func (s *StageService) BulkSetType(ids []int, stageType string) (models.BulkResult, error) {
	if len(ids) == 0 {
		return models.BulkResult{}, nil
	}
	if _, ok := creatableStageTypes[stageType]; !ok {
		return models.BulkResult{Failed: len(ids)}, ErrInvalidStageType
	}
	affected, err := s.StageRepo.UpdateTypeMany(ids, stageType)
	if err != nil {
		return models.BulkResult{Failed: len(ids)}, err
	}
	return models.BulkResult{
		Success: affected,
		Skipped: len(ids) - affected,
	}, nil
}

func (s *StageService) BulkSetColor(ids []int, color string) (models.BulkResult, error) {
	if len(ids) == 0 {
		return models.BulkResult{}, nil
	}
	affected, err := s.StageRepo.UpdateColorMany(ids, color)
	if err != nil {
		return models.BulkResult{Failed: len(ids)}, err
	}
	return models.BulkResult{
		Success: affected,
		Skipped: len(ids) - affected,
	}, nil
}

func (s *StageService) BulkSetIcon(ids []int, icon string) (models.BulkResult, error) {
	if len(ids) == 0 {
		return models.BulkResult{}, nil
	}
	affected, err := s.StageRepo.UpdateIconMany(ids, icon)
	if err != nil {
		return models.BulkResult{Failed: len(ids)}, err
	}
	return models.BulkResult{
		Success: affected,
		Skipped: len(ids) - affected,
	}, nil
}

func (s *StageService) BulkDelete(ids []int) (models.BulkResult, error) {
	if len(ids) == 0 {
		return models.BulkResult{}, nil
	}
	affected, err := s.StageRepo.DeleteMany(ids)
	if err != nil {
		return models.BulkResult{Failed: len(ids)}, err
	}
	return models.BulkResult{
		Success: affected,
		Skipped: len(ids) - affected,
	}, nil
}

func (s *StageService) BulkMoveStages(workflowId int, ids []int, beforeId *int) (models.BulkResult, error) {
	if len(ids) == 0 {
		return models.BulkResult{}, nil
	}
	moved, err := s.StageRepo.BulkMove(workflowId, ids, beforeId)
	if err != nil {
		return models.BulkResult{Failed: len(ids)}, err
	}
	return models.BulkResult{
		Success: moved,
		Skipped: len(ids) - moved,
	}, nil
}
