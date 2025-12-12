package services

import (
	"github.com/waseem-polus/aycorn/server/internal/models"
	"github.com/waseem-polus/aycorn/server/internal/models/repos"
)

type ProjectService struct {
	ProjectRepo *repos.ProjectRepo
	TaskRepo    *repos.TaskRepo
}

type projectDetails struct {
	Project *models.Project
	Tasks   []models.ChecklistTask
}

func (s *ProjectService) GetProjectDetails(projectId int) (*projectDetails, error) {
	project, err := s.ProjectRepo.FindOne(projectId)
	if err != nil {
		return nil, err
	}

	checklistTasks, err := s.TaskRepo.InProject(projectId)
	if err != nil {
		return nil, err
	}

	return &projectDetails{
		Project: project,
		Tasks:   checklistTasks,
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
