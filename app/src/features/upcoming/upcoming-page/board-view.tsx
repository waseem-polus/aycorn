import { useMemo } from "react";
import { useTaskTypesQuery } from "@/features/task-types/queries/useTaskTypesQuery";
import { useTaskTypeCategoriesQuery } from "@/features/task-types/queries/useTaskTypeCategoriesQuery";
import { buildBoardColumns } from "@/features/views/board/board-columns";
import { KanbanBoard } from "@/features/views/board/kanban-board";
import { applySort, type SortData } from "@/features/views/grouping/task-sorting";
import type { GroupByKey, SortRule } from "@/features/views/view-types";
import type { Stage, TaskWithProject, WorkflowSummary } from "@/types/types";

type Props = {
  tasks: TaskWithProject[];
  groupBy: GroupByKey | null;
  stages: Stage[];
  workflows: WorkflowSummary[];
  sort: SortRule[];
  sortData: SortData;
};

/**
 * /upcoming's board view, across projects. Stage columns come from the
 * workflows the shown tasks use, labelled with their workflow; a card can't
 * move to another workflow's stage. Tasks are created from a project, so
 * columns have no create control here.
 */
export function UpcomingBoardView({ tasks, groupBy, stages, workflows, sort, sortData }: Props) {
  const { data: taskTypes = [] } = useTaskTypesQuery();
  const { data: categories = [] } = useTaskTypeCategoriesQuery();
  const columns = useMemo(
    () =>
      // Columns keep their tasks' relative order, so sorting first sorts every column.
      buildBoardColumns(groupBy, applySort(tasks, sort, sortData), {
        stages,
        workflowNames: Object.fromEntries(workflows.map((w) => [w.ID, w.Name])),
        taskTypes,
        categories,
      }),
    [groupBy, tasks, stages, workflows, taskTypes, categories, sort, sortData],
  );

  return (
    <div className="flex flex-col flex-1 min-h-0">
      <KanbanBoard columns={columns} projectId={null} />
    </div>
  );
}
