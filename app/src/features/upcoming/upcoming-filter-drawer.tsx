import { SaveAdhocFilterButton } from "@/features/saved-filters/save-adhoc-filter-button";
import { FilterDrawerFrame } from "@/features/task-filters/filter-drawer-frame";
import { checklistOptionSource } from "@/features/task-filters/option-groups";
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

/** /upcoming's ad-hoc filter drawer. Its filters can be kept as a quick filter. */
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
    toggleFilter: onToggle,
    clearFilterDim: onClearDim,
    setDateFilter: onSetDate,
    setHasTimeFilter: onSetHasTime,
    setDateMode: onSetDateMode,
    resetAll: onReset,
    activeFilterCount,
    saveAdhocAsQuickFilter,
  } = useUpcomingFiltersContext();
  const activeCount = activeFilterCount();

  return (
    <FilterDrawerFrame
      open={open}
      onOpenChange={(v) => {
        if (!v) onClose();
      }}
      activeCount={activeCount}
      onReset={onReset}
      footerActions={
        activeCount > 0 && <SaveAdhocFilterButton onSave={saveAdhocAsQuickFilter} />
      }
    >
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-3">
          <span className="text-sm text-muted-foreground">Project</span>
          <ProjectSection
            projects={projects}
            selected={filters.project}
            onToggle={(k) => onToggle("project", k)}
            onClear={() => onClearDim("project")}
          />
          <ChecklistSection
            {...checklistOptionSource(facets.checklists, projects)}
            selected={filters.checklist}
            onToggle={(k) => onToggle("checklist", k)}
            onClear={() => onClearDim("checklist")}
          />
        </div>

        <div className="flex flex-col gap-3">
          <span className="text-sm text-muted-foreground">Task</span>
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
        </div>

        <div className="flex flex-col gap-3">
          <span className="text-sm text-muted-foreground">Dates</span>
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
        </div>
      </div>
    </FilterDrawerFrame>
  );
}
