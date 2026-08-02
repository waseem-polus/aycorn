package services

import (
	"database/sql"
	"errors"
	"strings"

	models "github.com/waseem-polus/aycorn/server/internal/models"
	"github.com/waseem-polus/aycorn/server/internal/models/repos"
)

var ErrDuplicateRelationship = errors.New("a relationship of this type already exists between these tasks")
var ErrSystemType = errors.New("system relationship types cannot be deleted")
var ErrTypeNotFound = errors.New("relationship type not found")

// behaviorColor maps each behavior to the canonical color for new types.
var behaviorColor = map[string]string{
	"blocking": "red",
	"subtask":  "emerald",
	"link":     "purple",
}

type TaskRelationshipService struct {
	TaskRelationshipRepo *repos.TaskRelationshipRepo
}

func (s *TaskRelationshipService) GetRelationshipTypes(filters *repos.TaskRelationshipTypeFilters) ([]models.TaskRelationshipType, error) {
	return s.TaskRelationshipRepo.AllTypes(filters)
}

func (s *TaskRelationshipService) GetTaskRelationships(taskId int) (models.TaskRelationshipsResult, error) {
	relationships, err := s.TaskRelationshipRepo.ForTask(taskId)
	if err != nil {
		return models.TaskRelationshipsResult{}, err
	}
	return models.TaskRelationshipsResult{Relationships: relationships}, nil
}

func (s *TaskRelationshipService) CreateRelationshipType(fromName, toName, behavior, icon string) (int, error) {
	color := behaviorColor[behavior]
	if color == "" {
		color = "gray"
	}
	return s.TaskRelationshipRepo.CreateType(fromName, toName, behavior, icon, color)
}

func (s *TaskRelationshipService) UpdateRelationshipType(id int, fromName, toName, behavior, icon string) error {
	color := behaviorColor[behavior]
	if color == "" {
		color = "gray"
	}
	err := s.TaskRelationshipRepo.UpdateType(id, fromName, toName, behavior, icon, color)
	if errors.Is(err, sql.ErrNoRows) {
		return ErrTypeNotFound
	}
	return err
}

func (s *TaskRelationshipService) UpdateRelationshipTypeIcon(id int, icon string) error {
	err := s.TaskRelationshipRepo.UpdateTypeIcon(id, icon)
	if errors.Is(err, sql.ErrNoRows) {
		return ErrTypeNotFound
	}
	return err
}

func (s *TaskRelationshipService) UpdateRelationshipTypeNames(id int, fromName, toName string) error {
	err := s.TaskRelationshipRepo.UpdateTypeNames(id, fromName, toName)
	if errors.Is(err, sql.ErrNoRows) {
		return ErrSystemType
	}
	return err
}

func (s *TaskRelationshipService) BulkUpdateBehavior(ids []int, behavior string) (models.BulkResult, error) {
	ids = dedupeInts(ids)
	if len(ids) == 0 {
		return models.BulkResult{}, nil
	}
	color := behaviorColor[behavior]
	if color == "" {
		color = "gray"
	}
	affected, err := s.TaskRelationshipRepo.UpdateManyBehavior(ids, behavior, color)
	if err != nil {
		return models.BulkResult{}, err
	}
	return models.BulkResult{
		Success: affected,
		Skipped: len(ids) - affected,
	}, nil
}

func (s *TaskRelationshipService) BulkDeleteRelationshipTypes(ids []int) (models.BulkResult, error) {
	ids = dedupeInts(ids)
	if len(ids) == 0 {
		return models.BulkResult{}, nil
	}
	affected, err := s.TaskRelationshipRepo.DeleteMany(ids)
	if err != nil {
		return models.BulkResult{}, err
	}
	return models.BulkResult{
		Success: affected,
		Skipped: len(ids) - affected,
	}, nil
}

func (s *TaskRelationshipService) DeleteRelationshipType(id int) error {
	err := s.TaskRelationshipRepo.DeleteType(id)
	if errors.Is(err, sql.ErrNoRows) {
		return ErrSystemType
	}
	return err
}

func (s *TaskRelationshipService) DeleteRelationship(id int) error {
	return s.TaskRelationshipRepo.Delete(id)
}

func (s *TaskRelationshipService) CreateRelationship(fromTaskID, toTaskID, typeID int) error {
	err := s.TaskRelationshipRepo.Create(fromTaskID, toTaskID, typeID)
	if err != nil && strings.Contains(err.Error(), "UNIQUE constraint failed") {
		return ErrDuplicateRelationship
	}
	return err
}

// BulkCreateRelationships links every task in taskIDs to targetTaskID, using
// direction to decide which side each selected task lands on (mirrors the
// single-create fromTaskId/toTaskId resolution used by the relationships
// drawer). A taskID equal to targetTaskID is dropped as a self-link before
// insertion; both that and any exact-duplicate triple (already linked) count
// toward Skipped rather than Failed.
func (s *TaskRelationshipService) BulkCreateRelationships(typeID int, direction string, targetTaskID int, taskIDs []int) (models.BulkResult, error) {
	taskIDs = dedupeInts(taskIDs)
	total := len(taskIDs)
	if total == 0 {
		return models.BulkResult{}, nil
	}

	pairs := make([][2]int, 0, total)
	for _, taskID := range taskIDs {
		if taskID == targetTaskID {
			continue
		}
		if direction == "from" {
			pairs = append(pairs, [2]int{taskID, targetTaskID})
		} else {
			pairs = append(pairs, [2]int{targetTaskID, taskID})
		}
	}

	affected, err := s.TaskRelationshipRepo.CreateMany(pairs, typeID)
	if err != nil {
		return models.BulkResult{}, err
	}
	return models.BulkResult{
		Success: affected,
		Skipped: total - affected,
	}, nil
}
