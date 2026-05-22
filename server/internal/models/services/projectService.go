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

func (s *ProjectService) GetAllProjects() ([]models.Project, error) {
	projects, err := s.ProjectRepo.All()
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
	success, err := s.ProjectRepo.UpdateProject(project)
	if err != nil {
		return false, err
	}

	return success, nil
}

func (s *ProjectService) CreateProject(workflowId int) (int64, error) {
	id, err := s.ProjectRepo.CreateProject(workflowId)
	if err != nil {
		return 0, err
	}

	if err := s.ChecklistRepo.CreateDefaultChecklist(int(id)); err != nil {
		return 0, err
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
