package services

import (
	"database/sql"
	"encoding/json"
	"errors"
	"fmt"
	"strings"

	"github.com/waseem-polus/aycorn/server/internal/models"
	"github.com/waseem-polus/aycorn/server/internal/models/repos"
)

var (
	ErrInvalidFilterDefinition = errors.New("invalid filter definition")
	ErrInvalidFilterView       = errors.New("invalid filter view")
	ErrInvalidFilterList       = errors.New("invalid filter list")
)

// supportedDefinitionVersions are the client definition versions the server
// accepts. The client upgrades older versions when loading, so a new version
// is added here alongside its upgrade step.
var supportedDefinitionVersions = map[int]bool{1: true, 2: true, 3: true}

// maxDefinitionBytes caps a stored definition; real ones are a few KB.
const maxDefinitionBytes = 64 * 1024

const untitledFilterName = "Untitled filter"

type SavedFilterService struct {
	SavedFilterRepo *repos.SavedFilterRepo
	ViewRepo        *repos.ViewRepo
}

func (s *SavedFilterService) GetAll() ([]models.SavedFilter, error) {
	return s.SavedFilterRepo.All()
}

// Create saves a new filter, optionally pinning it to the view it was saved
// from, and returns it with its pins.
func (s *SavedFilterService) Create(name string, definition json.RawMessage, pinView *int) (*models.SavedFilter, error) {
	if err := validateDefinition(definition); err != nil {
		return nil, err
	}
	if pinView != nil {
		if err := s.validateView(*pinView); err != nil {
			return nil, err
		}
	}
	id, err := s.SavedFilterRepo.Create(normalizeFilterName(name), definition, pinView)
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

func (s *SavedFilterService) Pin(id int, viewID int) error {
	if err := s.validateView(viewID); err != nil {
		return err
	}
	if _, err := s.SavedFilterRepo.FindOne(id); err != nil {
		return err
	}
	return s.SavedFilterRepo.Pin(id, viewID)
}

func (s *SavedFilterService) Unpin(id int, viewID int) error {
	if err := s.validateView(viewID); err != nil {
		return err
	}
	return s.SavedFilterRepo.Unpin(id, viewID)
}

// SetViewFilters replaces a view's pinned filters with ids, in order — the
// bar's drag reorder and the view menu's add / remove / reorder. Atomic: it
// commits all of ids or returns an error.
func (s *SavedFilterService) SetViewFilters(viewID int, ids []int) (models.BulkResult, error) {
	if err := s.validateView(viewID); err != nil {
		return models.BulkResult{}, err
	}
	seen := map[int]bool{}
	for _, id := range ids {
		if seen[id] {
			return models.BulkResult{}, fmt.Errorf("%w: filter %d listed twice", ErrInvalidFilterList, id)
		}
		seen[id] = true
	}
	existing, err := s.SavedFilterRepo.CountExisting(ids)
	if err != nil {
		return models.BulkResult{}, err
	}
	if existing != len(ids) {
		return models.BulkResult{}, fmt.Errorf("%w: unknown filter", ErrInvalidFilterList)
	}
	if err := s.SavedFilterRepo.SetViewFilters(viewID, ids); err != nil {
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

func (s *SavedFilterService) validateView(id int) error {
	if _, err := s.ViewRepo.FindOne(id); err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return fmt.Errorf("%w: view %d does not exist", ErrInvalidFilterView, id)
		}
		return err
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
