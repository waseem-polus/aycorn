package services

import (
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

func (s *ProjectService) CreateProject() (int64, error) {
	workflow, err := s.WorkflowRepo.FirstWorkflow()
	if err != nil {
		return 0, errors.New("no workflow available to assign to project: " + err.Error())
	}

	id, err := s.ProjectRepo.CreateProject(workflow.ID)
	if err != nil {
		return 0, err
	}

	return id, nil
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
