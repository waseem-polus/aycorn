package services

import (
	"errors"

	"github.com/waseem-polus/aycorn/server/internal/models"
	"github.com/waseem-polus/aycorn/server/internal/models/repos"
)

type WorkflowService struct {
	WorkflowRepo *repos.WorkflowRepo
	ProjectRepo  *repos.ProjectRepo
	StageRepo    *repos.StageRepo
}

type WorkflowSummary struct {
	models.Workflow
	ProjectCount int
	StageCount   int
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

		stageCount, err := s.StageRepo.CountByWorkflow(w.ID)
		if err != nil {
			return nil, err
		}

		stages, err := s.StageRepo.ByWorkflow(w.ID, listStagePreviewLimit)
		if err != nil {
			return nil, err
		}

		summaries = append(summaries, WorkflowSummary{
			Workflow:     w,
			ProjectCount: count,
			StageCount:   stageCount,
			Stages:       stages,
		})
	}

	return summaries, nil
}

func (s *WorkflowService) GetWorkflowDetails(id int) (*WorkflowSummary, error) {
	workflow, err := s.WorkflowRepo.FindOne(id)
	if err != nil {
		return nil, err
	}

	count, err := s.ProjectRepo.CountByWorkflow(id)
	if err != nil {
		return nil, err
	}

	stages, err := s.StageRepo.ByWorkflow(id, 0)
	if err != nil {
		return nil, err
	}

	return &WorkflowSummary{
		Workflow:     *workflow,
		ProjectCount: count,
		Stages:       stages,
	}, nil
}

func (s *WorkflowService) CreateWorkflow() (int64, error) {
	id, err := s.WorkflowRepo.Create("", "")
	if err != nil {
		return 0, err
	}

	for i, stageType := range defaultWorkflowStageTypes {
		defaults := repos.StageDefaults[stageType]
		_, err := s.StageRepo.Create(&models.Stage{
			Workflow:    int(id),
			Name:        defaults.Name,
			Description: defaults.Description,
			Color:       defaults.Color,
			Icon:        defaults.Icon,
			Position:    i + 1,
			Type:        defaults.Type,
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

func (s *WorkflowService) BulkDeleteWorkflows(ids []int) (models.BulkResult, error) {
	if len(ids) == 0 {
		return models.BulkResult{}, nil
	}

	deletable := []int{}
	skipped := 0
	for _, id := range ids {
		count, err := s.ProjectRepo.CountByWorkflow(id)
		if err != nil {
			return models.BulkResult{Failed: len(ids) - len(deletable) - skipped}, err
		}
		if count > 0 {
			skipped++
			continue
		}
		deletable = append(deletable, id)
	}

	if len(deletable) == 0 {
		return models.BulkResult{Skipped: skipped}, nil
	}

	affected, err := s.WorkflowRepo.DeleteMany(deletable)
	if err != nil {
		return models.BulkResult{Skipped: skipped, Failed: len(deletable)}, err
	}

	return models.BulkResult{
		Success: affected,
		Skipped: skipped + (len(deletable) - affected),
	}, nil
}

type BulkDuplicateResult struct {
	models.BulkResult
	NewIDs []int `json:"newIds"`
}

func (s *WorkflowService) BulkDuplicateWorkflows(ids []int) (BulkDuplicateResult, error) {
	if len(ids) == 0 {
		return BulkDuplicateResult{NewIDs: []int{}}, nil
	}

	newIDs := []int{}
	failed := 0

	for _, id := range ids {
		source, err := s.WorkflowRepo.FindOne(id)
		if err != nil {
			failed++
			continue
		}

		stages, err := s.StageRepo.ByWorkflow(id, 0)
		if err != nil {
			failed++
			continue
		}

		newID, err := s.WorkflowRepo.Create(source.Name+" (copy)", source.Description)
		if err != nil {
			failed++
			continue
		}

		stageErr := false
		for _, st := range stages {
			_, err := s.StageRepo.Create(&models.Stage{
				Workflow:    int(newID),
				Name:        st.Name,
				Description: st.Description,
				Color:       st.Color,
				Icon:        st.Icon,
				Position:    st.Position,
				Type:        st.Type,
			})
			if err != nil {
				stageErr = true
				break
			}
		}
		if stageErr {
			failed++
			continue
		}

		newIDs = append(newIDs, int(newID))
	}

	return BulkDuplicateResult{
		BulkResult: models.BulkResult{
			Success: len(newIDs),
			Failed:  failed,
		},
		NewIDs: newIDs,
	}, nil
}
