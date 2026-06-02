import { CalendarClock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { UpcomingGroupHeader } from "@/features/upcoming/upcoming-group-header";
import { UpcomingTaskRow } from "@/features/upcoming/upcoming-task-row";
import type { TaskGroup } from "@/features/upcoming/upcoming-grouping";
import type { Stage, Project } from "@/types/types";

type Props = {
  groups: TaskGroup[];
  filterCount: number;
  stageById: Record<number, Stage>;
  projectById: Record<number, Project>;
  isCollapsed: (key: string) => boolean;
  onToggleCollapsed: (key: string) => void;
  onResetFilters: () => void;
};

export function UpcomingTaskList({
  groups,
  filterCount,
  stageById,
  projectById,
  isCollapsed,
  onToggleCollapsed,
  onResetFilters,
}: Props) {
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
          <Button variant="outline" size="sm" onClick={onResetFilters}>
            Reset filters
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className="flex-1 min-h-0 rounded-lg border border-border overflow-y-auto">
      {groups.map((group) => {
        const collapsed = isCollapsed(group.key);
        return (
          <div key={group.key}>
            <UpcomingGroupHeader
              group={group}
              collapsed={collapsed}
              onToggle={() => onToggleCollapsed(group.key)}
            />
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
