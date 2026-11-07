package services

import (
	"encoding/json"
	"errors"
	"fmt"
	"strings"

	"github.com/waseem-polus/aycorn/server/internal/models"
	"github.com/waseem-polus/aycorn/server/internal/models/repos"
)

var (
	ErrInvalidView      = errors.New("invalid view")
	ErrInvalidViewOrder = errors.New("view order must be a permutation of the board's views")
	ErrLastView         = errors.New("a board must keep at least one view")
)

// viewSurfaces are the boards that have views — the same boards quick filters
// pin to.
var viewSurfaces = map[string]bool{"upcoming": true, "project": true}

// viewGrouping says which groupings a view type allows, and its default.
// Optional means "no grouping" (a null groupBy) is allowed too. Adding a
// layout or grouping is an edit here — the table doesn't constrain either.
type viewGrouping struct {
	options     []string
	optional    bool
	defaultKey  string
	upcomingKey []string // extra options only /upcoming offers
}

var dateGroupings = []string{"timePlanned", "timeCompleted", "timeCreated", "timeModified"}

var viewTypes = map[string]viewGrouping{
	"list": {
		options:     append([]string{"stage", "priority", "type", "assignee", "checklist"}, dateGroupings...),
		optional:    true,
		upcomingKey: []string{"project", "stageType"},
	},
	"board": {options: []string{"stage", "priority", "type"}, defaultKey: "stage"},
	"month": {options: dateGroupings, defaultKey: "timePlanned"},
	"week":  {options: dateGroupings, defaultKey: "timePlanned"},
}

// viewTypeDefaults name and decorate a new view of each type.
var viewTypeDefaults = map[string]struct{ name, icon string }{
	"list":  {"List", "rows-3"},
	"board": {"Board", "layout-dashboard"},
	"month": {"Month", "calendar-days"},
	"week":  {"Week", "calendar"},
}

var emptyViewSource = json.RawMessage(`{"version":3,"conditions":{"kind":"group","match":"all","children":[]}}`)

type ViewService struct {
	ViewRepo        *repos.ViewRepo
	SavedFilterRepo *repos.SavedFilterRepo
}

// ViewPatch mirrors the PATCH body: nil fields are left alone. GroupBy is
// set when the key is present; a JSON null clears it.
type ViewPatch struct {
	Name         *string
	Icon         *string
	Color        *string
	Type         *string
	GroupBy      *string
	HasGroupBy   bool
	GroupOptions *json.RawMessage
	Source       *json.RawMessage
}

func (s *ViewService) ForBoard(board models.FilterBoard) ([]models.View, error) {
	if err := s.validateBoard(board); err != nil {
		return nil, err
	}
	return s.ViewRepo.ForBoard(board)
}

// Create appends an empty view of the given type: default name, icon and
// grouping, and a source that filters nothing.
func (s *ViewService) Create(board models.FilterBoard, viewType string) (*models.View, error) {
	if err := s.validateBoard(board); err != nil {
		return nil, err
	}
	if _, ok := viewTypes[viewType]; !ok {
		return nil, fmt.Errorf("%w: unknown type %q", ErrInvalidView, viewType)
	}
	ids, err := s.ViewRepo.CreateMany(board, []repos.NewView{newView(board, viewType)})
	if err != nil {
		return nil, err
	}
	return s.ViewRepo.FindOne(ids[0])
}

// Duplicate copies a view to the end of its board.
func (s *ViewService) Duplicate(id int) (*models.View, error) {
	v, err := s.ViewRepo.FindOne(id)
	if err != nil {
		return nil, err
	}
	board := models.FilterBoard{Surface: v.Surface, ProjectID: v.ProjectID}
	ids, err := s.ViewRepo.CreateMany(board, []repos.NewView{{
		Name:         v.Name + " copy",
		Icon:         v.Icon,
		Color:        v.Color,
		Type:         v.Type,
		GroupBy:      v.GroupBy,
		GroupOptions: v.GroupOptions,
		Source:       v.Source,
	}})
	if err != nil {
		return nil, err
	}
	return s.ViewRepo.FindOne(ids[0])
}

// SeedProjectViews gives a new project the default views: List, Board, Month
// and Week, as the project page had before views were configurable.
func (s *ViewService) SeedProjectViews(projectID int) error {
	board := models.FilterBoard{Surface: "project", ProjectID: &projectID}
	views := []repos.NewView{}
	for _, t := range []string{"list", "board", "month", "week"} {
		views = append(views, newView(board, t))
	}
	_, err := s.ViewRepo.CreateMany(board, views)
	return err
}

// Update applies a partial patch. Changing the type re-checks the grouping:
// one the new type doesn't allow falls back to that type's default.
func (s *ViewService) Update(id int, p ViewPatch) (*models.View, error) {
	current, err := s.ViewRepo.FindOne(id)
	if err != nil {
		return nil, err
	}

	patch := repos.ViewPatch{Icon: p.Icon, Color: p.Color, GroupOptions: p.GroupOptions, Source: p.Source}
	if p.Name != nil {
		name := normalizeViewName(*p.Name, current.Type)
		patch.Name = &name
	}
	if p.Source != nil {
		if err := validateDefinition(*p.Source); err != nil {
			return nil, err
		}
	}
	if p.GroupOptions != nil && !json.Valid(*p.GroupOptions) {
		return nil, fmt.Errorf("%w: groupOptions must be JSON", ErrInvalidView)
	}

	viewType := current.Type
	if p.Type != nil {
		if _, ok := viewTypes[*p.Type]; !ok {
			return nil, fmt.Errorf("%w: unknown type %q", ErrInvalidView, *p.Type)
		}
		viewType = *p.Type
		patch.Type = p.Type
	}

	groupBy := current.GroupBy
	if p.HasGroupBy {
		groupBy = p.GroupBy
		if groupBy != nil && !groupingAllowed(viewType, current.Surface, *groupBy) {
			return nil, fmt.Errorf("%w: %s views can't group by %q", ErrInvalidView, viewType, *groupBy)
		}
	}
	// A grouping the (possibly new) type doesn't allow, or none where one is
	// required, falls back to the type's default.
	if groupBy != nil && !groupingAllowed(viewType, current.Surface, *groupBy) {
		groupBy = defaultGrouping(viewType, current.Surface)
	}
	if groupBy == nil && !viewTypes[viewType].optional {
		groupBy = defaultGrouping(viewType, current.Surface)
	}
	if groupBy == nil {
		patch.ClearGroupBy = true
	} else {
		patch.GroupBy = groupBy
	}

	if err := s.ViewRepo.Update(id, patch); err != nil {
		return nil, err
	}
	return s.ViewRepo.FindOne(id)
}

// Delete removes a view; a board's last view stays (ErrLastView).
func (s *ViewService) Delete(id int) error {
	if _, err := s.ViewRepo.FindOne(id); err != nil {
		return err
	}
	deleted, err := s.ViewRepo.DeleteUnlessLast(id)
	if err != nil {
		return err
	}
	if !deleted {
		return ErrLastView
	}
	return nil
}

// Reorder rewrites a board's tab order. The ids must be exactly the board's
// views, so a stale client can't drop or duplicate one.
func (s *ViewService) Reorder(board models.FilterBoard, ids []int) (models.BulkResult, error) {
	if err := s.validateBoard(board); err != nil {
		return models.BulkResult{}, err
	}
	current, err := s.ViewRepo.BoardViewIDs(board)
	if err != nil {
		return models.BulkResult{}, err
	}
	if !samePermutation(current, ids) {
		return models.BulkResult{}, ErrInvalidViewOrder
	}
	if err := s.ViewRepo.Reorder(ids); err != nil {
		return models.BulkResult{}, err
	}
	return models.BulkResult{Success: len(ids)}, nil
}

func (s *ViewService) validateBoard(b models.FilterBoard) error {
	if !viewSurfaces[b.Surface] {
		return fmt.Errorf("%w: unknown surface %q", ErrInvalidView, b.Surface)
	}
	if (b.Surface == "project") != (b.ProjectID != nil) {
		return fmt.Errorf("%w: only project boards take a projectId", ErrInvalidView)
	}
	if b.ProjectID != nil {
		exists, err := s.SavedFilterRepo.ProjectExists(*b.ProjectID)
		if err != nil {
			return err
		}
		if !exists {
			return fmt.Errorf("%w: project %d does not exist", ErrInvalidView, *b.ProjectID)
		}
	}
	return nil
}

func newView(board models.FilterBoard, viewType string) repos.NewView {
	defaults := viewTypeDefaults[viewType]
	options := json.RawMessage(`{}`)
	groupBy := defaultGrouping(viewType, board.Surface)
	if groupBy != nil && *groupBy == "timePlanned" && viewType == "list" {
		options = json.RawMessage(`{"granularity":"week"}`)
	}
	return repos.NewView{
		Name:         defaults.name,
		Icon:         defaults.icon,
		Color:        "gray",
		Type:         viewType,
		GroupBy:      groupBy,
		GroupOptions: options,
		Source:       emptyViewSource,
	}
}

// defaultGrouping is a type's default. /upcoming's list keeps grouping by
// planned date, as it always has; a project list starts ungrouped.
func defaultGrouping(viewType, surface string) *string {
	if viewType == "list" && surface == "upcoming" {
		key := "timePlanned"
		return &key
	}
	g := viewTypes[viewType]
	if g.defaultKey == "" {
		return nil
	}
	key := g.defaultKey
	return &key
}

func groupingAllowed(viewType, surface, key string) bool {
	g := viewTypes[viewType]
	for _, option := range g.options {
		if option == key {
			return true
		}
	}
	if surface == "upcoming" {
		for _, option := range g.upcomingKey {
			if option == key {
				return true
			}
		}
	}
	return false
}

func normalizeViewName(name, viewType string) string {
	if trimmed := strings.TrimSpace(name); trimmed != "" {
		return trimmed
	}
	return viewTypeDefaults[viewType].name
}
