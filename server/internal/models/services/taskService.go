package services

import (
	"errors"
	"fmt"

	"github.com/waseem-polus/aycorn/server/internal/models"
	"github.com/waseem-polus/aycorn/server/internal/models/repos"
	"github.com/waseem-polus/aycorn/server/internal/timefmt"
)

type TaskService struct {
	TaskRepo     *repos.TaskRepo
	TaskTypeRepo *repos.TaskTypeRepo
	// StageRepo backs the move/copy validation in taskTransferService.go:
	// stages are workflow-scoped, so a cross-project transfer has to check them.
	StageRepo *repos.StageRepo
}

func (s *TaskService) GetAllTasks(filters *repos.TaskFilters) ([]models.TaskWithProject, error) {
	return s.TaskRepo.AllTasks(filters)
}

func (s *TaskService) GetTaskFacets(projectID *int) (*models.TaskFacets, error) {
	return s.TaskRepo.TaskFacets(projectID)
}

func (s *TaskService) GetTask(taskId int) (*models.TaskWithProject, error) {
	task, err := s.TaskRepo.FindOneWithProject(taskId)
	if err != nil {
		return nil, err
	}
	return task, nil
}

func (s *TaskService) GetTaskBody(taskId int) (string, error) {
	taskBody, err := s.TaskRepo.GetTaskBody(taskId)
	if err != nil {
		return "[]", err
	}

	return taskBody, nil
}

func (s *TaskService) CreateChecklistTask(task *models.ChecklistTask) (*models.ChecklistTask, error) {
	if task.Type.ID == 0 && s.TaskTypeRepo != nil {
		defaultID, err := s.TaskTypeRepo.DefaultTypeID()
		if err != nil {
			return nil, err
		}
		task.Type.ID = defaultID
	}

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

func (s *TaskService) UpdateTaskBody(taskId int, body string) (bool, error) {
	success, err := s.TaskRepo.UpdateTaskBody(taskId, body)
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

var bulkTaskUpdatableColumns = map[string]string{
	"Stage":               "stage",
	"Priority":            "priority",
	"Type":                "type",
	"Assignee":            "assignee",
	"Checklist":           "checklist",
	"TimePlannedStart":    "timePlannedStart",
	"TimePlannedEnd":      "timePlannedEnd",
	"HasTimePlannedStart": "hasTimePlannedStart",
	"HasTimePlannedEnd":   "hasTimePlannedEnd",
}

// bulkTaskTimestampColumns are the columns whose bulk values arrive as raw JSON
// strings and must be normalized before they reach SQL. Unlike the single-task
// path they never pass through a time.Time, so without this they would be
// stored in whatever encoding the client happened to send.
var bulkTaskTimestampColumns = map[string]bool{
	"timePlannedStart": true,
	"timePlannedEnd":   true,
}

var ErrInvalidTimestamp = errors.New("timestamp must be a valid RFC3339 date")

// normalizeBulkTimestamp converts a bulk-update timestamp value to the
// canonical storage encoding. nil passes through — clearing a date is valid.
func normalizeBulkTimestamp(val any) (any, error) {
	if val == nil {
		return nil, nil
	}
	raw, ok := val.(string)
	if !ok {
		return nil, ErrInvalidTimestamp
	}
	normalized, err := timefmt.Normalize(raw)
	if err != nil {
		return nil, fmt.Errorf("%w: %s", ErrInvalidTimestamp, raw)
	}
	return normalized, nil
}

func (s *TaskService) BulkUpdate(ids []int, changes map[string]any) (models.BulkResult, error) {
	ids = dedupeInts(ids)
	if len(ids) == 0 {
		return models.BulkResult{}, nil
	}

	filtered := map[string]any{}
	for jsonKey, dbCol := range bulkTaskUpdatableColumns {
		v, ok := changes[jsonKey]
		if !ok {
			continue
		}
		if bulkTaskTimestampColumns[dbCol] {
			normalized, err := normalizeBulkTimestamp(v)
			if err != nil {
				return models.BulkResult{}, err
			}
			v = normalized
		}
		filtered[dbCol] = v
	}
	if len(filtered) == 0 {
		return models.BulkResult{Skipped: len(ids)}, nil
	}

	affected, err := s.TaskRepo.UpdateManyFields(ids, filtered)
	if err != nil {
		return models.BulkResult{}, err
	}
	return models.BulkResult{
		Success: affected,
		Skipped: len(ids) - affected, // non-existent ids: retrying won't help
	}, nil
}

func (s *TaskService) BulkDelete(ids []int) (models.BulkResult, error) {
	ids = dedupeInts(ids)
	if len(ids) == 0 {
		return models.BulkResult{}, nil
	}
	affected, err := s.TaskRepo.DeleteMany(ids)
	if err != nil {
		return models.BulkResult{}, err
	}
	return models.BulkResult{
		Success: affected,
		Skipped: len(ids) - affected,
	}, nil
}
