import { CalendarClock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { GroupHeader } from "@/features/views/grouping/group-header";
import { UpcomingTaskRow } from "@/features/upcoming/upcoming-task-row";
import { useUpcomingFiltersContext } from "@/features/upcoming/upcoming-filters-context";
import type { TaskGroup } from "@/features/views/grouping/task-grouping";
import type { Stage, Project, TaskWithProject } from "@/types/types";

type Props = {
  groups: TaskGroup<TaskWithProject>[];
  /** False for an ungrouped list: one group, no header. */
  showHeaders?: boolean;
  stageById: Record<number, Stage>;
  projectById: Record<number, Project>;
};

export function UpcomingTaskList({
  groups,
  showHeaders = true,
  stageById,
  projectById,
}: Props) {
  const { activeFilterCount, isCollapsed, toggleCollapsed, resetAll } =
    useUpcomingFiltersContext();
  const filterCount = activeFilterCount();
  if (groups.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed py-16 text-muted-foreground">
        <CalendarClock className="size-8" />
        <div className="text-center">
          <p className="font-medium">No tasks match these filters</p>
          <p className="text-sm">
            Adjust or reset the filters to see upcoming work.
          </p>
        </div>
        {filterCount > 0 && (
          <Button variant="outline" size="sm" onClick={resetAll}>
            Reset filters
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className="flex-1 min-h-0 rounded-lg border border-border overflow-y-auto">
      {groups.map((group) => {
        const collapsed = showHeaders && isCollapsed(group.key);
        return (
          <div key={group.key}>
            {showHeaders && (
              <GroupHeader
                group={group}
                collapsed={collapsed}
                onToggle={() => toggleCollapsed(group.key)}
              >
                <span className="shrink-0 hidden sm:flex w-1/8 text-xs text-muted-foreground">
                  Stage
                </span>
                <span className="shrink-0 hidden md:flex w-1/8 text-xs text-muted-foreground">
                  Type
                </span>
                <span className="w-1/5 lg:w-3/10" />
              </GroupHeader>
            )}
            {!collapsed && (
              <div>
                {group.tasks.length === 0 ? (
                  <div className="px-4 py-3 text-sm text-muted-foreground">
                    No tasks
                  </div>
                ) : (
                  group.tasks.map((task) => (
                    <UpcomingTaskRow
                      key={task.ID}
                      task={task}
                      stageById={stageById}
                      project={projectById[task.ProjectID]}
                    />
                  ))
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
