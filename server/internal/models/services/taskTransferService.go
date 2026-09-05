package services

import (
	"errors"
	"time"

	"github.com/waseem-polus/aycorn/server/internal/models"
	"github.com/waseem-polus/aycorn/server/internal/models/repos"
)

var (
	// ErrDestinationStageRequired means at least one selected task sits on a
	// stage the destination project's workflow doesn't contain, and the client
	// sent no replacement. The client is expected to prompt for one and retry.
	ErrDestinationStageRequired = errors.New("a destination stage is required: some tasks are on stages the destination workflow does not have")
	// ErrInvalidDestinationStage means the requested stage isn't part of the
	// destination project's workflow.
	ErrInvalidDestinationStage = errors.New("destination stage does not belong to the destination project's workflow")
	// ErrDestinationChecklistRequired guards a move with nowhere to move to.
	ErrDestinationChecklistRequired = errors.New("a destination checklist is required")
)

const copySuffix = " (copy)"

// resolvedTransfer is a validated destination: the checklist tasks will land in
// and the stage decision that applies to all of them. A nil stage means every
// task keeps the one it already has.
type resolvedTransfer struct {
	dest  *repos.TransferDestination
	stage *int
}

// resolveTransfer loads the destination and settles the stage question for the
// whole selection.
//
// Stages are workflow-scoped, so a task can only keep its stage when the
// destination project runs the same workflow. When every selected task already
// sits on a stage of the destination workflow nothing needs deciding; otherwise
// the caller must have supplied a stage, which is then applied to all of them.
func (s *TaskService) resolveTransfer(
	tasks []models.TaskWithProject,
	checklistId int,
	stageId *int,
) (*resolvedTransfer, error) {
	dest, err := s.TaskRepo.ResolveDestination(checklistId)
	if err != nil {
		return nil, err
	}

	destStages, err := s.StageRepo.ByWorkflow(dest.WorkflowID, 0)
	if err != nil {
		return nil, err
	}
	valid := make(map[int]struct{}, len(destStages))
	for _, stage := range destStages {
		valid[stage.ID] = struct{}{}
	}

	if stageId != nil {
		if _, ok := valid[*stageId]; !ok {
			return nil, ErrInvalidDestinationStage
		}
		return &resolvedTransfer{dest: dest, stage: stageId}, nil
	}

	for _, task := range tasks {
		if _, ok := valid[task.Stage]; !ok {
			return nil, ErrDestinationStageRequired
		}
	}

	return &resolvedTransfer{dest: dest, stage: nil}, nil
}

// BulkMove repoints tasks at another project by rewriting the two columns that
// carry a task's project: checklist and (when the workflow differs) stage.
func (s *TaskService) BulkMove(ids []int, checklistId int, stageId *int) (models.BulkResult, error) {
	ids = dedupeInts(ids)
	if len(ids) == 0 {
		return models.BulkResult{}, nil
	}
	if checklistId == 0 {
		return models.BulkResult{}, ErrDestinationChecklistRequired
	}

	tasks, err := s.TaskRepo.FindManyForTransfer(ids)
	if err != nil {
		return models.BulkResult{}, err
	}
	// Ids that no longer exist: retrying won't help.
	notFound := len(ids) - len(tasks)
	if len(tasks) == 0 {
		return models.BulkResult{Skipped: notFound}, nil
	}

	transfer, err := s.resolveTransfer(tasks, checklistId, stageId)
	if err != nil {
		return models.BulkResult{}, err
	}

	moveIds := make([]int, 0, len(tasks))
	for _, task := range tasks {
		moveIds = append(moveIds, task.ID)
	}

	affected, err := s.TaskRepo.MoveMany(moveIds, transfer.dest.ChecklistID, transfer.stage)
	if err != nil {
		return models.BulkResult{}, err
	}

	return models.BulkResult{
		Success: affected,
		Skipped: notFound,
		Failed:  len(tasks) - affected,
	}, nil
}

// BulkCopy creates a new task per source. A nil checklistId means every copy
// stays where its source is — that's the same-project "Duplicate", which works
// even for a selection spanning several projects.
//
// Everything that isn't project-scoped comes across untouched: name, body,
// type, assignee, priority and planned dates.
func (s *TaskService) BulkCopy(
	ids []int,
	checklistId *int,
	stageId *int,
	copyRelationships bool,
) (BulkDuplicateResult, error) {
	ids = dedupeInts(ids)
	if len(ids) == 0 {
		return BulkDuplicateResult{NewIDs: []int{}}, nil
	}

	tasks, err := s.TaskRepo.FindManyForTransfer(ids)
	if err != nil {
		return BulkDuplicateResult{}, err
	}
	notFound := len(ids) - len(tasks)
	if len(tasks) == 0 {
		return BulkDuplicateResult{
			BulkResult: models.BulkResult{Skipped: notFound},
			NewIDs:     []int{},
		}, nil
	}

	var transfer *resolvedTransfer
	if checklistId != nil {
		transfer, err = s.resolveTransfer(tasks, *checklistId, stageId)
		if err != nil {
			return BulkDuplicateResult{}, err
		}
	}

	// A stage's type decides whether a completion date is meaningful on the
	// copy, so look them up once for the workflows involved.
	doneStages, err := s.doneStageIds(tasks, transfer)
	if err != nil {
		return BulkDuplicateResult{}, err
	}

	plans := make([]repos.CopyPlan, 0, len(tasks))
	for _, task := range tasks {
		plan := repos.CopyPlan{
			Source:      task,
			Name:        task.Name,
			ChecklistID: task.Checklist,
			StageID:     task.Stage,
		}
		if transfer != nil {
			plan.ChecklistID = transfer.dest.ChecklistID
			if transfer.stage != nil {
				plan.StageID = *transfer.stage
			}
			// A copy landing beside its original needs to be tellable apart;
			// one landing in a different project has no such collision.
			if transfer.dest.ProjectID == task.ProjectID {
				plan.Name = task.Name + copySuffix
			}
		} else {
			plan.Name = task.Name + copySuffix
		}

		plan.TimeCompleted = copiedCompletion(task.TimeCompleted, doneStages, plan.StageID)
		plans = append(plans, plan)
	}

	newIDs, err := s.TaskRepo.CopyMany(plans, copyRelationships)
	if err != nil {
		return BulkDuplicateResult{}, err
	}

	return BulkDuplicateResult{
		BulkResult: models.BulkResult{
			Success: len(newIDs),
			Skipped: notFound,
		},
		NewIDs: newIDs,
	}, nil
}

// copiedCompletion decides the copy's timeCompleted. A completion date only
// makes sense on a `done` stage, and there it should be the source's date
// rather than today's — which is what happens if it is left NULL, since the
// insert trigger stamps `now` in that case.
func copiedCompletion(sourceCompleted *time.Time, doneStages map[int]struct{}, stageId int) *time.Time {
	if _, done := doneStages[stageId]; !done {
		return nil
	}
	return sourceCompleted
}

// doneStageIds collects the ids of every `done` stage a copy could land on: the
// destination workflow's stages when the copies change project, otherwise the
// stages the sources are already sitting on.
func (s *TaskService) doneStageIds(
	tasks []models.TaskWithProject,
	transfer *resolvedTransfer,
) (map[int]struct{}, error) {
	if transfer != nil {
		stages, err := s.StageRepo.ByWorkflow(transfer.dest.WorkflowID, 0)
		if err != nil {
			return nil, err
		}
		return doneSet(stages), nil
	}

	stageIds := make([]int, 0, len(tasks))
	for _, task := range tasks {
		stageIds = append(stageIds, task.Stage)
	}
	stages, err := s.StageRepo.FindManyByIds(dedupeInts(stageIds))
	if err != nil {
		return nil, err
	}
	return doneSet(stages), nil
}

func doneSet(stages []models.Stage) map[int]struct{} {
	done := map[int]struct{}{}
	for _, stage := range stages {
		if stage.Type == "done" {
			done[stage.ID] = struct{}{}
		}
	}
	return done
}
