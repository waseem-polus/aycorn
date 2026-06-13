package main

import "net/http"

func (app *app) routes() http.Handler {
	mux := http.NewServeMux()

	mux.HandleFunc("OPTIONS /", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, POST, DELETE")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")
		w.WriteHeader(http.StatusNoContent)
	})
	mux.HandleFunc("GET /api/", app.getDashboard)

	mux.HandleFunc("GET /api/project", app.getAllProjects)
	mux.HandleFunc("GET /api/project/pinned", app.getPinnedProjects)
	mux.HandleFunc("GET /api/project/checklist/{projectId}", app.getProjectChecklists)

	mux.HandleFunc("PUT /api/project/bulk/pinned", app.bulkSetProjectsPinned)
	mux.HandleFunc("POST /api/project/bulk/delete", app.bulkDeleteProjects)

	mux.HandleFunc("GET /api/project/{projectId}/settings/workflow", app.getProjectWorkflowSettings)
	mux.HandleFunc("PUT /api/project/{projectId}/settings/workflow", app.switchProjectWorkflow)
	mux.HandleFunc("GET /api/project/{projectId}/settings/task-types", app.getProjectTaskTypeSettings)
	mux.HandleFunc("PUT /api/project/{projectId}/settings/task-types", app.putProjectTaskTypes)
	mux.HandleFunc("GET /api/project/{projectId}/settings/task-types/enabled", app.getProjectTaskTypes)
	mux.HandleFunc("POST /api/project/{projectId}/settings/task-types/bulk/enable-category", app.postEnableTaskTypeCategory)
	mux.HandleFunc("GET /api/project/{projectId}", app.getProject)
	mux.HandleFunc("PUT /api/project/{projectId}", app.putProject)
	mux.HandleFunc("DELETE /api/project/{projectId}", app.deleteProject)
	mux.HandleFunc("POST /api/project", app.postProject)

	mux.HandleFunc("GET /api/tasks", app.getUpcomingTasks)
	mux.HandleFunc("GET /api/tasks/facets", app.getTaskFacets)
	mux.HandleFunc("GET /api/task/{taskId}", app.getTask)
	mux.HandleFunc("GET /api/task/body/{taskId}", app.getTaskBody)
	mux.HandleFunc("POST /api/task", app.postTask)
	mux.HandleFunc("PUT /api/task", app.putTask)
	mux.HandleFunc("PUT /api/task/bulk", app.bulkUpdateTasks)
	mux.HandleFunc("POST /api/task/bulk/delete", app.bulkDeleteTasks)
	mux.HandleFunc("DELETE /api/task/{taskId}", app.deleteTask)
	mux.HandleFunc("GET /api/task/relationships/{taskId}", app.getTaskRelationships)

	mux.HandleFunc("GET /api/task-relationship-type", app.getAllTaskRelationshipTypes)

	mux.HandleFunc("POST /api/checklist/{projectId}", app.postChecklist)
	mux.HandleFunc("PUT /api/checklist", app.putChecklist)
	mux.HandleFunc("DELETE /api/checklist/{checklistId}", app.deleteChecklist)

	mux.HandleFunc("GET /api/task-type", app.getAllTaskTypes)
	mux.HandleFunc("POST /api/task-type", app.postTaskType)
	mux.HandleFunc("PUT /api/task-type/bulk", app.bulkUpdateTaskTypes)
	mux.HandleFunc("POST /api/task-type/bulk/delete", app.bulkDeleteTaskTypes)
	mux.HandleFunc("PUT /api/task-type/{id}", app.putTaskType)
	mux.HandleFunc("DELETE /api/task-type/{id}", app.deleteTaskType)

	mux.HandleFunc("GET /api/task-type-category", app.getAllTaskTypeCategories)
	mux.HandleFunc("POST /api/task-type-category", app.postTaskTypeCategory)
	mux.HandleFunc("PUT /api/task-type-category/reorder", app.putTaskTypeCategoryReorder)
	mux.HandleFunc("PUT /api/task-type-category/{id}", app.putTaskTypeCategory)
	mux.HandleFunc("DELETE /api/task-type-category/{id}", app.deleteTaskTypeCategory)

	mux.HandleFunc("GET /api/workflow", app.getAllWorkflows)
	mux.HandleFunc("POST /api/workflow/bulk/delete", app.bulkDeleteWorkflows)
	mux.HandleFunc("POST /api/workflow/bulk/duplicate", app.bulkDuplicateWorkflows)
	mux.HandleFunc("GET /api/workflow/{workflowId}", app.getWorkflow)
	mux.HandleFunc("POST /api/workflow", app.postWorkflow)
	mux.HandleFunc("PUT /api/workflow/{workflowId}", app.putWorkflow)
	mux.HandleFunc("DELETE /api/workflow/{workflowId}", app.deleteWorkflow)
	mux.HandleFunc("PUT /api/workflow/{workflowId}/stages/order", app.putWorkflowStagesOrder)
	mux.HandleFunc("PUT /api/workflow/{workflowId}/stages/move", app.bulkMoveStages)
	mux.HandleFunc("POST /api/workflow/{workflowId}/stage", app.postStage)

	mux.HandleFunc("GET /api/stage", app.getAllStages)
	mux.HandleFunc("PUT /api/stage/bulk/type", app.bulkSetStageType)
	mux.HandleFunc("PUT /api/stage/bulk/color", app.bulkSetStageColor)
	mux.HandleFunc("PUT /api/stage/bulk/icon", app.bulkSetStageIcon)
	mux.HandleFunc("POST /api/stage/bulk/delete", app.bulkDeleteStages)
	mux.HandleFunc("PUT /api/stage/{stageId}", app.putStage)
	mux.HandleFunc("DELETE /api/stage/{stageId}", app.deleteStage)

	if spa := spaHandler(); spa != nil {
		mux.Handle("GET /", spa)
	}

	return withCommon(mux)
}
