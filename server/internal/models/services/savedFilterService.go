package services

import (
	"encoding/json"
	"errors"
	"fmt"
	"sort"
	"strings"

	"github.com/waseem-polus/aycorn/server/internal/models"
	"github.com/waseem-polus/aycorn/server/internal/models/repos"
)

var (
	ErrInvalidFilterDefinition = errors.New("invalid filter definition")
	ErrInvalidFilterBoard      = errors.New("invalid filter board")
	ErrInvalidFilterOrder      = errors.New("filter order must be a permutation of the filters pinned to that board")
)

// supportedDefinitionVersions are the client definition versions the server
// accepts. The client upgrades older versions when loading, so a new version
// is added here alongside its upgrade step.
var supportedDefinitionVersions = map[int]bool{1: true, 2: true, 3: true}

// maxDefinitionBytes caps a stored definition; real ones are a few KB.
const maxDefinitionBytes = 64 * 1024

const untitledFilterName = "Untitled filter"

// filterSurfaces are the places a filter can be pinned. A future surface (a
// view, a widget) is added here — the table deliberately doesn't constrain it.
var filterSurfaces = map[string]bool{"upcoming": true, "project": true}

type SavedFilterService struct {
	SavedFilterRepo *repos.SavedFilterRepo
}

func (s *SavedFilterService) GetAll() ([]models.SavedFilter, error) {
	return s.SavedFilterRepo.All()
}

// Create saves a new filter, optionally pinning it to the board it was saved
// from, and returns it with its pins.
func (s *SavedFilterService) Create(name string, definition json.RawMessage, pin *models.FilterBoard) (*models.SavedFilter, error) {
	if err := validateDefinition(definition); err != nil {
		return nil, err
	}
	if pin != nil {
		if err := s.validateBoard(*pin); err != nil {
			return nil, err
		}
	}
	id, err := s.SavedFilterRepo.Create(normalizeFilterName(name), definition, pin)
	if err != nil {
		return nil, err
	}
	return s.findWithPins(id)
}

// Update applies a partial patch: rename, save a new definition, or (later)
// change cosmetic fields.
func (s *SavedFilterService) Update(id int, name *string, definition *json.RawMessage) error {
	patch := repos.SavedFilterPatch{Definition: definition}
	if name != nil {
		normalized := normalizeFilterName(*name)
		patch.Name = &normalized
	}
	if definition != nil {
		if err := validateDefinition(*definition); err != nil {
			return err
		}
	}
	return s.SavedFilterRepo.Update(id, patch)
}

func (s *SavedFilterService) Duplicate(id int) (*models.SavedFilter, error) {
	newID, err := s.SavedFilterRepo.Duplicate(id)
	if err != nil {
		return nil, err
	}
	return s.findWithPins(newID)
}

// BulkDelete deletes filters in one statement. Ids that don't exist are
// reported as skipped; their pins go with them via the cascade.
func (s *SavedFilterService) BulkDelete(ids []int) (models.BulkResult, error) {
	deleted, err := s.SavedFilterRepo.DeleteMany(ids)
	if err != nil {
		return models.BulkResult{}, err
	}
	return models.BulkResult{Success: deleted, Skipped: len(ids) - deleted}, nil
}

func (s *SavedFilterService) SetPins(id int, boards []models.FilterBoard) error {
	for _, b := range boards {
		if err := s.validateBoard(b); err != nil {
			return err
		}
	}
	if _, err := s.SavedFilterRepo.FindOne(id); err != nil {
		return err
	}
	return s.SavedFilterRepo.SetPins(id, boards)
}

func (s *SavedFilterService) Pin(id int, board models.FilterBoard) error {
	if err := s.validateBoard(board); err != nil {
		return err
	}
	if _, err := s.SavedFilterRepo.FindOne(id); err != nil {
		return err
	}
	return s.SavedFilterRepo.Pin(id, board)
}

func (s *SavedFilterService) Unpin(id int, board models.FilterBoard) error {
	if err := s.validateBoard(board); err != nil {
		return err
	}
	return s.SavedFilterRepo.Unpin(id, board)
}

// ReorderBoard rewrites a board's quick-filter order. The ids must be exactly
// the filters pinned there, so a stale client can't drop or duplicate pins.
func (s *SavedFilterService) ReorderBoard(board models.FilterBoard, ids []int) (models.BulkResult, error) {
	if err := s.validateBoard(board); err != nil {
		return models.BulkResult{}, err
	}
	current, err := s.SavedFilterRepo.BoardFilterIDs(board)
	if err != nil {
		return models.BulkResult{}, err
	}
	if !samePermutation(current, ids) {
		return models.BulkResult{}, ErrInvalidFilterOrder
	}
	if err := s.SavedFilterRepo.ReorderBoard(board, ids); err != nil {
		return models.BulkResult{}, err
	}
	return models.BulkResult{Success: len(ids)}, nil
}

func (s *SavedFilterService) findWithPins(id int) (*models.SavedFilter, error) {
	all, err := s.SavedFilterRepo.All()
	if err != nil {
		return nil, err
	}
	for i := range all {
		if all[i].ID == id {
			return &all[i], nil
		}
	}
	_, err = s.SavedFilterRepo.FindOne(id)
	return nil, err
}

func (s *SavedFilterService) validateBoard(b models.FilterBoard) error {
	if !filterSurfaces[b.Surface] {
		return fmt.Errorf("%w: unknown surface %q", ErrInvalidFilterBoard, b.Surface)
	}
	if (b.Surface == "project") != (b.ProjectID != nil) {
		return fmt.Errorf("%w: only project boards take a projectId", ErrInvalidFilterBoard)
	}
	if b.ProjectID != nil {
		exists, err := s.SavedFilterRepo.ProjectExists(*b.ProjectID)
		if err != nil {
			return err
		}
		if !exists {
			return fmt.Errorf("%w: project %d does not exist", ErrInvalidFilterBoard, *b.ProjectID)
		}
	}
	return nil
}

// validateDefinition checks the envelope only: a JSON object with a supported
// version. The contents are the client's editing shape and aren't
// interpreted here; a malformed tree is still rejected when it's sent to
// /api/tasks as conditions.
func validateDefinition(definition json.RawMessage) error {
	if len(definition) > maxDefinitionBytes {
		return fmt.Errorf("%w: larger than %d bytes", ErrInvalidFilterDefinition, maxDefinitionBytes)
	}
	var envelope struct {
		Version *int `json:"version"`
	}
	if err := json.Unmarshal(definition, &envelope); err != nil {
		return fmt.Errorf("%w: %v", ErrInvalidFilterDefinition, err)
	}
	if envelope.Version == nil || !supportedDefinitionVersions[*envelope.Version] {
		return fmt.Errorf("%w: unsupported version", ErrInvalidFilterDefinition)
	}
	return nil
}

func normalizeFilterName(name string) string {
	if trimmed := strings.TrimSpace(name); trimmed != "" {
		return trimmed
	}
	return untitledFilterName
}

func samePermutation(a, b []int) bool {
	if len(a) != len(b) {
		return false
	}
	x := append([]int(nil), a...)
	y := append([]int(nil), b...)
	sort.Ints(x)
	sort.Ints(y)
	for i := range x {
		if x[i] != y[i] {
			return false
		}
	}
	return true
}
