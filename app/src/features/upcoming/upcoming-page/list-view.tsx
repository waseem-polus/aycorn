import { useMemo } from "react";
import { UpcomingTaskList } from "@/features/upcoming/upcoming-page/task-list";
import { useUpcomingFiltersContext } from "@/features/upcoming/upcoming-filters-context";
import { buildGroups, sortTasks } from "@/features/views/grouping/task-grouping";
import type { GroupingData } from "@/features/views/grouping/task-grouping";
import type { Project, Stage, TaskWithProject } from "@/types/types";
import type { TaskGroup } from "@/features/views/grouping/task-grouping";
import { useToday } from "@/features/task-filters/hooks/useToday";

type Props = {
  tasks: TaskWithProject[];
  stageById: Record<number, Stage>;
  projectById: Record<number, Project>;
  groupingData: GroupingData;
};

export function UpcomingListView({
  tasks,
  stageById,
  projectById,
  groupingData,
}: Props) {
  const { view } = useUpcomingFiltersContext();

  const today = useToday();
  const { groupBy, granularity } = view;
  const groups = useMemo<TaskGroup<TaskWithProject>[]>(
    () =>
      groupBy
        ? buildGroups(tasks, { groupBy, granularity, today, data: groupingData })
        : // Ungrouped: one headerless group.
          [{ key: "all", label: "All tasks", order: 0, tasks: sortTasks(tasks) }],
    [tasks, groupBy, granularity, today, groupingData],
  );

  return (
    <UpcomingTaskList
      showHeaders={groupBy !== null}
      groups={groups.filter((g) => g.tasks.length > 0)}
      stageById={stageById}
      projectById={projectById}
    />
  );
}
