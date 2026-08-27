import { useMemo } from "react";
import { UpcomingTaskList } from "@/features/upcoming/upcoming-page/task-list";
import { useUpcomingFiltersContext } from "@/features/upcoming/upcoming-filters-context";
import { buildGroups } from "@/features/upcoming/upcoming-grouping";
import type { GroupingData } from "@/features/upcoming/upcoming-grouping";
import type { Project, Stage, TaskWithProject } from "@/types/types";

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

  const groups = useMemo(
    () =>
      buildGroups(tasks, {
        groupBy: view.groupBy,
        granularity: view.granularity,
        today: new Date(),
        showEmpty: view.showEmpty,
        data: groupingData,
      }),
    [tasks, view.groupBy, view.granularity, view.showEmpty, groupingData],
  );

  return (
    <UpcomingTaskList
      groups={groups}
      stageById={stageById}
      projectById={projectById}
    />
  );
}
