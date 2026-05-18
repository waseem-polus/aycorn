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

var ErrInvalidStageColor = errors.New("stage color is not in the allowed palette")

var ErrCannotDeleteOpenStage = errors.New("the open stage cannot be deleted")

var ErrStageHasTasks = errors.New("stage has tasks — provide moveTasksTo")

var ErrInvalidMoveDestination = errors.New("move destination must be an existing stage that is not being deleted")

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
	if !models.IsValidStageColor(stage.Color) {
		return false, ErrInvalidStageColor
	}
	return s.StageRepo.Update(stage)
}

// partitionByOpen splits fetched stages into the IDs that may be acted on
// (non-open) and the count of open stages, which are intentionally skipped.
func partitionByOpen(stages []models.Stage) (actable []int, skipped int) {
	actable = make([]int, 0, len(stages))
	for _, stage := range stages {
		if stage.Type == "open" {
			skipped++
			continue
		}
		actable = append(actable, stage.ID)
	}
	return actable, skipped
}

// validateMoveDestinations rejects mappings whose destination is the source
// itself, is one of the stages being deleted, or does not exist.
func (s *StageService) validateMoveDestinations(mappings map[int]int, deleting map[int]struct{}) error {
	if len(mappings) == 0 {
		return nil
	}
	seen := map[int]struct{}{}
	destIds := make([]int, 0, len(mappings))
	for from, to := range mappings {
		if to == from {
			return ErrInvalidMoveDestination
		}
		if _, gone := deleting[to]; gone {
			return ErrInvalidMoveDestination
		}
		if _, dup := seen[to]; !dup {
			seen[to] = struct{}{}
			destIds = append(destIds, to)
		}
	}
	found, err := s.StageRepo.FindManyByIds(destIds)
	if err != nil {
		return err
	}
	if len(found) != len(destIds) {
		return ErrInvalidMoveDestination
	}
	return nil
}

func (s *StageService) DeleteStage(id int, moveTasksTo *int) (bool, error) {
	stage, err := s.StageRepo.FindOne(id)
	if err != nil {
		return false, err
	}

	if stage.Type == "open" {
		return false, ErrCannotDeleteOpenStage
	}

	if stage.TaskCount > 0 && moveTasksTo == nil {
		return false, ErrStageHasTasks
	}

	if moveTasksTo != nil {
		mappings := map[int]int{id: *moveTasksTo}
		if err := s.validateMoveDestinations(mappings, map[int]struct{}{id: {}}); err != nil {
			return false, err
		}
		affected, err := s.StageRepo.DeleteManyWithTaskMove([]int{id}, mappings)
		return affected > 0, err
	}

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

	stages, err := s.StageRepo.FindManyByIds(ids)
	if err != nil {
		return models.BulkResult{Failed: len(ids)}, err
	}

	toUpdate, skipped := partitionByOpen(stages)

	affected, err := s.StageRepo.UpdateTypeMany(toUpdate, stageType)
	if err != nil {
		return models.BulkResult{Failed: len(toUpdate)}, err
	}
	return models.BulkResult{
		Success: affected,
		Skipped: skipped,
		Failed:  len(ids) - affected - skipped,
	}, nil
}

func (s *StageService) BulkSetColor(ids []int, color string) (models.BulkResult, error) {
	if len(ids) == 0 {
		return models.BulkResult{}, nil
	}
	if !models.IsValidStageColor(color) {
		return models.BulkResult{Failed: len(ids)}, ErrInvalidStageColor
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

func (s *StageService) BulkDelete(ids []int, taskMappings map[int]int) (models.BulkResult, error) {
	if len(ids) == 0 {
		return models.BulkResult{}, nil
	}

	stages, err := s.StageRepo.FindManyByIds(ids)
	if err != nil {
		return models.BulkResult{Failed: len(ids)}, err
	}

	toDelete, skipped := partitionByOpen(stages)
	deleting := make(map[int]struct{}, len(toDelete))
	for _, id := range toDelete {
		deleting[id] = struct{}{}
	}

	// Every stage being deleted that still holds tasks needs a destination.
	filteredMappings := map[int]int{}
	for _, stage := range stages {
		if _, ok := deleting[stage.ID]; !ok || stage.TaskCount == 0 {
			continue
		}
		dest, ok := taskMappings[stage.ID]
		if !ok {
			return models.BulkResult{}, ErrStageHasTasks
		}
		filteredMappings[stage.ID] = dest
	}

	if err := s.validateMoveDestinations(filteredMappings, deleting); err != nil {
		return models.BulkResult{}, err
	}

	affected, err := s.StageRepo.DeleteManyWithTaskMove(toDelete, filteredMappings)
	if err != nil {
		return models.BulkResult{Failed: len(toDelete)}, err
	}

	return models.BulkResult{
		Success: affected,
		Skipped: skipped,
		Failed:  len(ids) - affected - skipped,
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
