package services

import (
	"errors"

	"github.com/waseem-polus/aycorn/server/internal/models"
	"github.com/waseem-polus/aycorn/server/internal/models/repos"
)

type WorkflowService struct {
	WorkflowRepo *repos.WorkflowRepo
	ProjectRepo  *repos.ProjectRepo
}

type WorkflowSummary struct {
	models.Workflow
	ProjectCount int
	Stages       []models.Stage
}

const listStagePreviewLimit = 6

var defaultWorkflowStageTypes = []string{"open", "doing", "done"}

var ErrWorkflowInUse = errors.New("workflow is in use by one or more projects")

func (s *WorkflowService) GetAllWorkflows() ([]WorkflowSummary, error) {
	workflows, err := s.WorkflowRepo.All()
	if err != nil {
		return nil, err
	}

	summaries := []WorkflowSummary{}
	for _, w := range workflows {
		count, err := s.ProjectRepo.CountByWorkflow(w.ID)
		if err != nil {
			return nil, err
		}

		stages, err := s.WorkflowRepo.StagesByWorkflow(w.ID, listStagePreviewLimit)
		if err != nil {
			return nil, err
		}

		summaries = append(summaries, WorkflowSummary{
			Workflow:     w,
			ProjectCount: count,
			Stages:       stages,
		})
	}

	return summaries, nil
}

func (s *WorkflowService) CreateWorkflow() (int64, error) {
	id, err := s.WorkflowRepo.Create("", "")
	if err != nil {
		return 0, err
	}

	for i, stageType := range defaultWorkflowStageTypes {
		defaults := repos.StageDefaults[stageType]
		_, err := s.WorkflowRepo.CreateStage(&models.Stage{
			Workflow: int(id),
			Name:     defaults.Name,
			Color:    defaults.Color,
			Icon:     defaults.Icon,
			Position: i + 1,
			Type:     defaults.Type,
		})
		if err != nil {
			return 0, err
		}
	}

	return id, nil
}

func (s *WorkflowService) UpdateWorkflow(workflow *models.Workflow) (bool, error) {
	return s.WorkflowRepo.Update(workflow)
}

func (s *WorkflowService) DeleteWorkflow(id int) (bool, error) {
	count, err := s.ProjectRepo.CountByWorkflow(id)
	if err != nil {
		return false, err
	}
	if count > 0 {
		return false, ErrWorkflowInUse
	}

	return s.WorkflowRepo.Delete(id)
}
