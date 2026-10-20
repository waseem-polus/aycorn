import { Switch } from "@/components/ui/switch";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { BasicFiltersAccordion } from "@/features/task-filters/basic-filters-accordion";
import { summarizeFilters } from "@/features/task-filters/filter-summary";
import { ConditionBuilder } from "@/features/task-filters/conditions/condition-builder";
import type { ConditionOptionSources } from "@/features/task-filters/conditions/condition-builder-context";
import { FilterDrawerFrame } from "@/features/task-filters/filter-drawer-frame";
import {
  assigneeOptionSource,
  checklistOptionSource,
  priorityOptionSource,
  projectOptionSource,
  stageOptionSource,
  taskTypeOptionSource,
} from "@/features/task-filters/option-groups";
import { DateFilterSection } from "@/features/task-filters/sections/date-filter-section";
import { ProjectSection } from "@/features/task-filters/sections/project-section";
import { StatusSection } from "@/features/task-filters/sections/status-section";
import { TypeSection } from "@/features/task-filters/sections/type-section";
import { AssigneeSection } from "@/features/task-filters/sections/assignee-section";
import { ChecklistSection } from "@/features/task-filters/sections/checklist-section";
import { PrioritySection } from "@/features/task-filters/sections/priority-section";
import { useUpcomingFiltersContext } from "@/features/upcoming/upcoming-filters-context";
import type {
  Project,
  Stage,
  TaskFacets,
  TaskTypeCategory,
  TaskTypeGlobal,
  WorkflowSummary,
} from "@/types/types";

type Props = {
  open: boolean;
  projects: Project[];
  stages: Stage[];
  workflows: WorkflowSummary[];
  taskTypes: TaskTypeGlobal[];
  taskTypeCategories: TaskTypeCategory[];
  facets: TaskFacets;
  onClose: () => void;
};

export function UpcomingFilterDrawer({
  open,
  projects,
  stages,
  workflows,
  taskTypes,
  taskTypeCategories,
  facets,
  onClose,
}: Props) {
  const {
    filters,
    view,
    conditions,
    toggleFilter: onToggle,
    clearFilterDim: onClearDim,
    setDateFilter: onSetDate,
    setHasTimeFilter: onSetHasTime,
    setDateMode: onSetDateMode,
    setShowEmpty: onToggleEmpty,
    resetAll: onReset,
    activeFilterCount,
  } = useUpcomingFiltersContext();
  const showEmpty = view.showEmpty;
  const activeCount = activeFilterCount();

  const checklistSource = checklistOptionSource(facets.checklists, projects);
  const sources: ConditionOptionSources = {
    project: projectOptionSource(projects),
    checklist: checklistSource,
    stage: stageOptionSource(stages, workflows),
    type: taskTypeOptionSource(taskTypes, taskTypeCategories),
    assignee: assigneeOptionSource(facets.assignees),
    priority: priorityOptionSource(),
  };

  const projectCount = filters.project.length + filters.checklist.length;
  const singleProject =
    filters.project.length === 1 && filters.checklist.length === 0
      ? projects.find((p) => p.ID === filters.project[0])?.Name
      : undefined;
  const taskCount =
    filters.stage.length +
    filters.type.length +
    filters.assignee.length +
    filters.priority.length;
  const dateCount = (["plannedMode", "completedMode"] as const).filter(
    (k) => (filters.dates?.[k] ?? "all") !== "all",
  ).length;

  return (
    <FilterDrawerFrame
      open={open}
      onOpenChange={(v) => {
        if (!v) onClose();
      }}
      activeCount={activeCount}
      onReset={onReset}
    >
      <div className="flex flex-col gap-6">
        <BasicFiltersAccordion
          activeCount={activeCount - conditions.completeCount}
          rows={[
            {
              value: "project",
              label: "Project",
              summary: summarizeFilters(projectCount, singleProject),
              content: (
                <>
                  <ProjectSection
                    projects={projects}
                    selected={filters.project}
                    onToggle={(k) => onToggle("project", k)}
                    onClear={() => onClearDim("project")}
                  />
                  <ChecklistSection
                    {...checklistSource}
                    selected={filters.checklist}
                    onToggle={(k) => onToggle("checklist", k)}
                    onClear={() => onClearDim("checklist")}
                  />
                </>
              ),
            },
            {
              value: "task",
              label: "Task",
              summary: summarizeFilters(taskCount),
              content: (
                <>
                  <StatusSection
                    stages={stages}
                    workflows={workflows}
                    selected={filters.stage}
                    onToggle={(k) => onToggle("stage", k)}
                    onClear={() => onClearDim("stage")}
                  />
                  <TypeSection
                    taskTypes={taskTypes}
                    categories={taskTypeCategories}
                    selected={filters.type}
                    onToggle={(k) => onToggle("type", k)}
                    onClear={() => onClearDim("type")}
                  />
                  <AssigneeSection
                    assignees={facets.assignees}
                    selected={filters.assignee}
                    onToggle={(k) => onToggle("assignee", k)}
                    onClear={() => onClearDim("assignee")}
                  />
                  <PrioritySection
                    selected={filters.priority}
                    onToggle={(k) => onToggle("priority", k)}
                    onClear={() => onClearDim("priority")}
                  />
                </>
              ),
            },
            {
              value: "dates",
              label: "Dates",
              summary: summarizeFilters(dateCount),
              content: (
                <>
                  <DateFilterSection
                    label="Time Planned"
                    modeKey="plannedMode"
                    modeLabels={{
                      all: "All Tasks (Planned & Not Planned)",
                      none: "Not Planned",
                      with: "Planned",
                    }}
                    fromKey="plannedFrom"
                    toKey="plannedTo"
                    hasFromTimeKey="plannedFromHasTime"
                    hasToTimeKey="plannedToHasTime"
                    mode="datetime"
                    dates={filters.dates}
                    onSet={onSetDate}
                    onSetHasTime={onSetHasTime}
                    onSetMode={onSetDateMode}
                  />
                  <DateFilterSection
                    label="Time Completed"
                    modeKey="completedMode"
                    modeLabels={{
                      all: "All Tasks (Completed & Not Completed)",
                      none: "Not Completed",
                      with: "Completed",
                    }}
                    fromKey="completedFrom"
                    toKey="completedTo"
                    hasFromTimeKey="completedFromHasTime"
                    hasToTimeKey="completedToHasTime"
                    mode="datetime"
                    dates={filters.dates}
                    onSet={onSetDate}
                    onSetHasTime={onSetHasTime}
                    onSetMode={onSetDateMode}
                  />
                </>
              ),
            },
          ]}
        />

        <ConditionBuilder tree={conditions} sources={sources} />
      </div>

      <Alert className="flex justify-between items-center">
        <div>
          <AlertTitle>Show empty groups</AlertTitle>
          <AlertDescription>
            Reveal groups that currently have no tasks
          </AlertDescription>
        </div>
        <Switch
          checked={showEmpty}
          onCheckedChange={onToggleEmpty}
          onClick={(e) => e.stopPropagation()}
        />
      </Alert>
    </FilterDrawerFrame>
  );
}
