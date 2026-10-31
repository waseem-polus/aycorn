import { useContext } from "react";
import { FilterIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ProjectContext } from "@/contexts/project/ProjectContext";
import { BasicFiltersAccordion } from "@/features/task-filters/basic-filters-accordion";
import { summarizeFilters } from "@/features/task-filters/filter-summary";
import { ConditionBuilder } from "@/features/task-filters/conditions/condition-builder";
import type { ConditionOptionSources } from "@/features/task-filters/conditions/condition-builder-context";
import { FilterDrawerFrame } from "@/features/task-filters/filter-drawer-frame";
import {
  assigneeOptionSource,
  checklistOptionSource,
  priorityOptionSource,
  stageOptionSource,
  stageTypeOptionSource,
  taskTypeOptionSource,
} from "@/features/task-filters/option-groups";
import { AssigneeSection } from "@/features/task-filters/sections/assignee-section";
import { ChecklistSection } from "@/features/task-filters/sections/checklist-section";
import { DateFilterSection } from "@/features/task-filters/sections/date-filter-section";
import { PrioritySection } from "@/features/task-filters/sections/priority-section";
import { StatusSection } from "@/features/task-filters/sections/status-section";
import { TypeSection } from "@/features/task-filters/sections/type-section";
import { useTaskFacetsQuery } from "@/features/task-filters/queries/useTaskFacetsQuery";
import { useProjectTaskTypesQuery } from "@/features/task-types/queries/useProjectTaskTypesQuery";
import { useTaskTypeCategoriesQuery } from "@/features/task-types/queries/useTaskTypeCategoriesQuery";
import { useProjectFiltersContext } from "@/features/project-filters/project-filters-context";

/**
 * The project page's filter drawer. Same sections as the upcoming page minus
 * the project picker — this drawer is already scoped to one project, so the
 * condition builder doesn't offer Project either.
 */
export function ProjectFiltersDrawer() {
  const { Project, Stages } = useContext(ProjectContext);
  const {
    filters,
    conditions,
    toggleFilter: onToggle,
    clearFilterDim: onClearDim,
    setDateFilter: onSetDate,
    setHasTimeFilter: onSetHasTime,
    setDateMode: onSetDateMode,
    resetAll: onReset,
    activeFilterCount,
    plannedFilterApplies,
  } = useProjectFiltersContext();

  const { data: facets = { assignees: [], checklists: [] } } = useTaskFacetsQuery(
    Project.ID,
  );
  const { data: taskTypes = [] } = useProjectTaskTypesQuery(Project.ID);
  const { data: taskTypeCategories = [] } = useTaskTypeCategoriesQuery();

  // A planned filter set while a calendar view is open isn't sent, so it
  // shouldn't be counted either.
  const activeCount = activeFilterCount(
    plannedFilterApplies ? undefined : { ignoreDateModes: ["plannedMode"] },
  );

  const checklistSource = checklistOptionSource(facets.checklists);
  const sources: ConditionOptionSources = {
    checklist: checklistSource,
    stage: stageOptionSource(Stages),
    type: taskTypeOptionSource(taskTypes, taskTypeCategories),
    assignee: assigneeOptionSource(facets.assignees),
    priority: priorityOptionSource(),
    stageType: stageTypeOptionSource(),
  };

  const taskCount =
    filters.stage.length +
    filters.type.length +
    filters.assignee.length +
    filters.priority.length;
  const dateCount = (["plannedMode", "completedMode"] as const).filter(
    (k) =>
      (plannedFilterApplies || k !== "plannedMode") &&
      (filters.dates?.[k] ?? "all") !== "all",
  ).length;
  const singleChecklist =
    filters.checklist.length === 1
      ? facets.checklists.find((c) => c.id === filters.checklist[0])?.name
      : undefined;

  return (
    <FilterDrawerFrame
      trigger={
        <Button
          size="icon"
          variant="outline"
          aria-label="Filters"
          className="relative"
        >
          <FilterIcon />
          {activeCount > 0 && (
            <Badge
              variant="secondary"
              className="absolute -top-1.5 -right-1.5 size-5 justify-center rounded-full p-0 text-xs tabular-nums"
            >
              {activeCount}
            </Badge>
          )}
        </Button>
      }
      activeCount={activeCount}
      onReset={onReset}
    >
      <div className="flex flex-col gap-6">
        <BasicFiltersAccordion
          activeCount={activeCount - conditions.completeCount}
          rows={[
            {
              value: "checklist",
              label: "Checklist",
              summary: summarizeFilters(filters.checklist.length, singleChecklist),
              content: (
                <ChecklistSection
                  {...checklistSource}
                  selected={filters.checklist}
                  onToggle={(k) => onToggle("checklist", k)}
                  onClear={() => onClearDim("checklist")}
                />
              ),
            },
            {
              value: "task",
              label: "Task",
              summary: summarizeFilters(taskCount),
              content: (
                <>
                  <StatusSection
                    stages={Stages}
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
    </FilterDrawerFrame>
  );
}
