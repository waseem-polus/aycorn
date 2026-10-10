package services

import (
	"errors"

	"github.com/waseem-polus/aycorn/server/internal/models"
	"github.com/waseem-polus/aycorn/server/internal/models/repos"
)

var ErrDefaultTaskType = errors.New("the default task type cannot be deleted")
var ErrTransferTypeRequired = errors.New("a transfer type is required when deleting a type that has tasks")
var ErrInvalidTransferType = errors.New("the transfer type must be a surviving type, not one being deleted")

type TaskTypeService struct {
	TaskTypeRepo *repos.TaskTypeRepo
	CategoryRepo *repos.TaskTypeCategoryRepo
}

func (s *TaskTypeService) GetAll(filter string) ([]models.TaskTypeGlobal, error) {
	return s.TaskTypeRepo.AllWithCounts(filter)
}

// GetInUseForProject lists the types the project's tasks already use. Every
// type is usable in every project, so this exists only to keep the project's
// type filters free of options that would match nothing.
func (s *TaskTypeService) GetInUseForProject(projectId int) ([]models.TaskType, error) {
	return s.TaskTypeRepo.InUseForProject(projectId)
}

func (s *TaskTypeService) Create(tt *models.TaskType) (*models.TaskType, error) {
	if tt.Icon == "" {
		tt.Icon = "square-check"
	}
	if tt.Color == "" {
		tt.Color = "gray"
	}
	if tt.Category == 0 {
		defaultID, err := s.CategoryRepo.DefaultID()
		if err != nil {
			return nil, err
		}
		tt.Category = defaultID
	}
	return s.TaskTypeRepo.Create(tt)
}

func (s *TaskTypeService) Update(tt *models.TaskType) (bool, error) {
	return s.TaskTypeRepo.Update(tt)
}

func (s *TaskTypeService) Delete(id int, transferToID int) error {
	existing, err := s.TaskTypeRepo.FindOne(id)
	if err != nil {
		return err
	}
	if existing.IsDefault {
		return ErrDefaultTaskType
	}

	return s.TaskTypeRepo.TransferAndDelete(id, transferToID)
}

// bulkTaskTypeUpdatableColumns whitelists the fields a bulk update may set,
// mapping the JSON key (PascalCase, matching models.TaskType) to its column.
var bulkTaskTypeUpdatableColumns = map[string]string{
	"Icon":     "icon",
	"Color":    "color",
	"Category": "category",
}

func (s *TaskTypeService) BulkUpdate(ids []int, changes map[string]any) (models.BulkResult, error) {
	ids = dedupeInts(ids)
	if len(ids) == 0 {
		return models.BulkResult{}, nil
	}

	filtered := map[string]any{}
	for jsonKey, dbCol := range bulkTaskTypeUpdatableColumns {
		if v, ok := changes[jsonKey]; ok {
			filtered[dbCol] = v
		}
	}
	if len(filtered) == 0 {
		return models.BulkResult{Skipped: len(ids)}, nil
	}

	affected, err := s.TaskTypeRepo.UpdateManyFields(ids, filtered)
	if err != nil {
		return models.BulkResult{}, err
	}
	return models.BulkResult{
		Success: affected,
		Skipped: len(ids) - affected, // non-existent ids: retrying won't help
	}, nil
}

// BulkDelete deletes the given types, routing each deleted type's tasks to its
// mapped destination. Default types and unknown ids are skipped (never deleted),
// matching how stage bulk-delete skips the open stage. Every non-default type
// that still holds tasks must map to a surviving type.
func (s *TaskTypeService) BulkDelete(ids []int, taskMappings map[int]int) (models.BulkResult, error) {
	ids = dedupeInts(ids)
	if len(ids) == 0 {
		return models.BulkResult{}, nil
	}

	all, err := s.TaskTypeRepo.AllWithCounts("")
	if err != nil {
		return models.BulkResult{}, err
	}
	byID := map[int]models.TaskTypeGlobal{}
	for _, t := range all {
		byID[t.ID] = t
	}

	toDelete := []int{}
	deleting := map[int]struct{}{}
	skipped := 0
	for _, id := range ids {
		t, ok := byID[id]
		if !ok || t.IsDefault {
			skipped++
			continue
		}
		toDelete = append(toDelete, id)
		deleting[id] = struct{}{}
	}
	if len(toDelete) == 0 {
		return models.BulkResult{Skipped: skipped}, nil
	}

	// Every type being deleted that still holds tasks needs a surviving destination.
	filteredMappings := map[int]int{}
	for _, id := range toDelete {
		if byID[id].TaskCount == 0 {
			continue
		}
		dest, ok := taskMappings[id]
		if !ok {
			return models.BulkResult{}, ErrTransferTypeRequired
		}
		if _, isDeleting := deleting[dest]; isDeleting || dest == id {
			return models.BulkResult{}, ErrInvalidTransferType
		}
		if _, exists := byID[dest]; !exists {
			return models.BulkResult{}, ErrInvalidTransferType
		}
		filteredMappings[id] = dest
	}

	affected, err := s.TaskTypeRepo.BulkTransferAndDelete(toDelete, filteredMappings)
	if err != nil {
		return models.BulkResult{}, err
	}

	return models.BulkResult{
		Success: affected,
		Skipped: skipped,
		Failed:  len(toDelete) - affected,
	}, nil
}
