package services

import (
	"database/sql"
	"errors"

	"github.com/waseem-polus/aycorn/server/internal/models"
	"github.com/waseem-polus/aycorn/server/internal/models/repos"
)

type ProjectService struct {
	ProjectRepo   *repos.ProjectRepo
	TaskRepo      *repos.TaskRepo
	ChecklistRepo *repos.ChecklistRepo
	WorkflowRepo  *repos.WorkflowRepo
	StageRepo     *repos.StageRepo
	TaskTypeRepo  *repos.TaskTypeRepo
	FolderRepo    *repos.ProjectFolderRepo
}

type projectDetails struct {
	Project    *models.Project
	Workflow   *models.Workflow
	Stages     []models.Stage
	Checklists []models.ChecklistDetails
	Tasks      []models.ChecklistTask
}

type projectWorkflowSettings struct {
	Project  *models.Project
	Workflow *models.Workflow
	Stages   []models.Stage
}

func (s *ProjectService) GetProjectWorkflowSettings(projectId int) (*projectWorkflowSettings, error) {
	project, err := s.ProjectRepo.FindOne(projectId)
	if err != nil {
		return nil, err
	}

	workflow, err := s.WorkflowRepo.FindOne(project.Workflow)
	if err != nil {
		return nil, err
	}

	stages, err := s.StageRepo.ByWorkflowForProject(project.Workflow, projectId)
	if err != nil {
		return nil, err
	}

	return &projectWorkflowSettings{
		Project:  project,
		Workflow: workflow,
		Stages:   stages,
	}, nil
}

var ErrNoOpenStage = errors.New("target workflow has no open stage")
var ErrInvalidStageMapping = errors.New("stage mapping must map a current-workflow stage to a stage in the new workflow")

func (s *ProjectService) SwitchProjectWorkflow(projectId int, newWorkflowId int, mappings map[int]int) (models.BulkResult, error) {
	project, err := s.ProjectRepo.FindOne(projectId)
	if err != nil {
		return models.BulkResult{}, err
	}

	if project.Workflow == newWorkflowId {
		return models.BulkResult{}, nil
	}

	openStage, err := s.StageRepo.FirstByType(newWorkflowId, "open")
	if errors.Is(err, sql.ErrNoRows) {
		return models.BulkResult{}, ErrNoOpenStage
	}
	if err != nil {
		return models.BulkResult{}, err // unexpected DB failure -> 500
	}

	newStages, err := s.StageRepo.ByWorkflow(newWorkflowId, 0)
	if err != nil {
		return models.BulkResult{}, err
	}
	validTargets := map[int]struct{}{}
	for _, st := range newStages {
		validTargets[st.ID] = struct{}{}
	}

	oldStages, err := s.StageRepo.ByWorkflow(project.Workflow, 0)
	if err != nil {
		return models.BulkResult{}, err
	}
	validSources := map[int]struct{}{}
	for _, st := range oldStages {
		validSources[st.ID] = struct{}{}
	}

	for fromId, toId := range mappings {
		if fromId == toId {
			return models.BulkResult{}, ErrInvalidStageMapping
		}
		if _, ok := validSources[fromId]; !ok {
			return models.BulkResult{}, ErrInvalidStageMapping
		}
		if _, ok := validTargets[toId]; !ok {
			return models.BulkResult{}, ErrInvalidStageMapping
		}
	}

	moved, err := s.ProjectRepo.SwitchWorkflow(
		projectId, project.Workflow, newWorkflowId, openStage.ID, mappings,
	)
	if err != nil {
		return models.BulkResult{}, err
	}

	return models.BulkResult{Success: moved}, nil
}

func (s *ProjectService) GetProjectDetails(projectId int, taskFilters *repos.TaskFilters) (*projectDetails, error) {
	project, err := s.ProjectRepo.FindOne(projectId)
	if err != nil {
		return nil, err
	}

	workflow, err := s.WorkflowRepo.FindOne(project.Workflow)
	if err != nil {
		return nil, err
	}

	stages, err := s.StageRepo.ByWorkflow(project.Workflow, 0)
	if err != nil {
		return nil, err
	}

	checklists, err := s.ChecklistRepo.InProject(projectId)
	if err != nil {
		return nil, err
	}

	tasks, err := s.TaskRepo.InProject(projectId, taskFilters)
	if err != nil {
		return nil, err
	}

	return &projectDetails{
		Project:    project,
		Workflow:   workflow,
		Stages:     stages,
		Tasks:      tasks,
		Checklists: checklists,
	}, nil
}

func (s *ProjectService) GetAllProjects(archived *bool) ([]models.Project, error) {
	projects, err := s.ProjectRepo.All(archived)
	if err != nil {
		return nil, err
	}

	return projects, nil
}

func (s *ProjectService) GetPinnedProjects() ([]models.Project, error) {
	projects, err := s.ProjectRepo.FindPinnedProjects()
	if err != nil {
		return nil, err
	}

	return projects, nil
}

func (s *ProjectService) UpdateProject(project *models.Project) (bool, error) {
	// Folder is a recent addition, and callers that only mean to rename send the
	// project without it. Treat the zero value as "leave it where it is" rather
	// than letting it through to fail the FK.
	if project.Folder == 0 {
		existing, err := s.ProjectRepo.FindOne(project.ID)
		if err != nil {
			return false, err
		}
		project.Folder = existing.Folder
	}

	success, err := s.ProjectRepo.UpdateProject(project)
	if err != nil {
		return false, err
	}

	return success, nil
}

func (s *ProjectService) CreateProject(workflowId int, folderId int) (int64, error) {
	if folderId == 0 {
		var err error
		folderId, err = s.FolderRepo.DefaultID()
		if err != nil {
			return 0, err
		}
	}

	id, err := s.ProjectRepo.CreateProject(workflowId, folderId)
	if err != nil {
		return 0, err
	}

	if err := s.ChecklistRepo.CreateDefaultChecklist(int(id)); err != nil {
		return 0, err
	}

	if s.TaskTypeRepo != nil {
		if err := s.TaskTypeRepo.AddDefaultTypeToProject(int(id)); err != nil {
			return 0, err
		}
	}

	return id, nil
}

func (s *ProjectService) BulkSetPinned(ids []int, pinned bool) (models.BulkResult, error) {
	ids = dedupeInts(ids)
	if len(ids) == 0 {
		return models.BulkResult{}, nil
	}
	affected, err := s.ProjectRepo.UpdateManyPinned(ids, pinned)
	if err != nil {
		return models.BulkResult{}, err
	}
	return models.BulkResult{
		Success: affected,
		Skipped: len(ids) - affected, // non-existent ids: retrying won't help
	}, nil
}

func (s *ProjectService) BulkSetArchived(ids []int, archived bool) (models.BulkResult, error) {
	ids = dedupeInts(ids)
	if len(ids) == 0 {
		return models.BulkResult{}, nil
	}
	affected, err := s.ProjectRepo.UpdateManyArchived(ids, archived)
	if err != nil {
		return models.BulkResult{}, err
	}
	return models.BulkResult{
		Success: affected,
		Skipped: len(ids) - affected, // missing, or already in the target state
	}, nil
}

func (s *ProjectService) BulkSetFolder(ids []int, folderId int) (models.BulkResult, error) {
	ids = dedupeInts(ids)
	if len(ids) == 0 {
		return models.BulkResult{}, nil
	}

	// Fail loudly on a bad folder rather than silently unfiling projects.
	if _, err := s.FolderRepo.FindOne(folderId); err != nil {
		return models.BulkResult{}, err
	}

	affected, err := s.ProjectRepo.UpdateManyFolder(ids, folderId)
	if err != nil {
		return models.BulkResult{}, err
	}
	return models.BulkResult{
		Success: affected,
		Skipped: len(ids) - affected,
	}, nil
}

var ErrInvalidPinnedOrder = errors.New("pinned order must be a permutation of the pinned projects")

// ReorderPinnedProjects rewrites the sidebar order atomically. It requires the
// full set, since ReorderPinned only rewrites the indices it is handed and a
// partial list would leave duplicate sortIndex values behind.
func (s *ProjectService) ReorderPinnedProjects(ids []int) (models.BulkResult, error) {
	ids = dedupeInts(ids)

	current, err := s.ProjectRepo.PinnedIDs()
	if err != nil {
		return models.BulkResult{}, err
	}
	if len(ids) != len(current) {
		return models.BulkResult{}, ErrInvalidPinnedOrder
	}

	pinned := make(map[int]struct{}, len(current))
	for _, id := range current {
		pinned[id] = struct{}{}
	}
	for _, id := range ids {
		if _, ok := pinned[id]; !ok {
			return models.BulkResult{}, ErrInvalidPinnedOrder
		}
	}

	if err := s.ProjectRepo.ReorderPinned(ids); err != nil {
		return models.BulkResult{}, err
	}
	return models.BulkResult{Success: len(ids)}, nil
}

// DuplicateProjectConfig creates a new project carrying the source project's
// configuration. Nothing is cloned: workflows and task types are reusable across
// projects by design, so the copy points at the same workflow row and enables
// the same task type ids.
//
// The steps are kept separate so a future duplicateChecklists step can be added
// without touching the existing ones.
func (s *ProjectService) DuplicateProjectConfig(sourceId int) (int, error) {
	source, err := s.ProjectRepo.FindOne(sourceId)
	if err != nil {
		return 0, err
	}

	newId, err := s.applyWorkflow(source)
	if err != nil {
		return 0, err
	}

	if err := s.applyTaskTypes(sourceId, newId); err != nil {
		return 0, err
	}

	// Future: if err := s.applyChecklists(sourceId, newId); err != nil { ... }

	if _, err := s.ProjectRepo.UpdateProject(&models.Project{
		ID:       newId,
		Name:     source.Name + " (copy)",
		Workflow: source.Workflow,
		Folder:   source.Folder,
	}); err != nil {
		return 0, err
	}

	return newId, nil
}

// applyWorkflow creates the new project against the source's workflow. This is
// the seam where a variant that clones the workflow instead of sharing it would
// live.
func (s *ProjectService) applyWorkflow(source *models.Project) (int, error) {
	id, err := s.CreateProject(source.Workflow, 0)
	if err != nil {
		return 0, err
	}
	return int(id), nil
}

func (s *ProjectService) applyTaskTypes(sourceId int, targetId int) error {
	typeIds, err := s.TaskTypeRepo.EnabledIDsForProject(sourceId)
	if err != nil {
		return err
	}
	return s.TaskTypeRepo.SetEnabledForProject(targetId, typeIds)
}

func (s *ProjectService) BulkDeleteProjects(ids []int) (models.BulkResult, error) {
	ids = dedupeInts(ids)
	if len(ids) == 0 {
		return models.BulkResult{}, nil
	}
	affected, err := s.ProjectRepo.DeleteMany(ids)
	if err != nil {
		return models.BulkResult{}, err
	}
	return models.BulkResult{
		Success: affected,
		Skipped: len(ids) - affected,
	}, nil
}

func (s *ProjectService) DeleteProject(projectId int) (bool, error) {
	tasksSuccess, err := s.TaskRepo.DeleteTasksInProject(projectId)
	if err != nil {
		return false, err
	}

	checklistsSuccess, err := s.ChecklistRepo.DeleteChecklistsInProject(projectId)
	if err != nil {
		return false, err
	}

	projectSuccess, err := s.ProjectRepo.DeleteProject(projectId)
	if err != nil {
		return false, err
	}

	return tasksSuccess && checklistsSuccess && projectSuccess, nil
}
