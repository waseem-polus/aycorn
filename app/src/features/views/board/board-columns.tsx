import type { ReactNode } from "react";
import { DynamicIcon, type IconName } from "lucide-react/dynamic";
import { StageIcon } from "@/features/stage/stage-visual";
import { stageStrokeClass } from "@/features/stage/stage-palette";
import TaskPriorityIcon from "@/features/task/properties/icons/TaskPriorityIcon";
import type { GroupByKey } from "@/features/views/view-types";
import {
  PRIORITIES,
  type ChecklistTask,
  type Stage,
  type Task,
  type TaskType,
  type TaskTypeCategory,
} from "@/types/types";

/**
 * One column of a board view: which tasks it holds, how it looks, and what
 * dropping a task into it changes. Built from the view's grouping, so the
 * board itself never knows whether it's showing stages, priorities or types.
 */
export type BoardColumn<T extends ChecklistTask = ChecklistTask> = {
  key: string;
  label: string;
  /** Shown under the label (truncated, with a tooltip). */
  description?: string;
  marker: ReactNode;
  /** Palette color for the drop highlight. */
  color: string;
  tasks: T[];
  /** The edit dropping a task here makes — also what a task created here starts with. */
  changes: Partial<Task>;
  /** Why a task can't be dropped here, or null when it can. */
  rejects: (task: Task) => string | null;
};

export type BoardColumnData = {
  stages: Stage[];
  /** Workflow names by id; when given, stage columns name their workflow (cross-project boards). */
  workflowNames?: Record<number, string>;
  taskTypes: TaskType[];
  categories: TaskTypeCategory[];
};

const accept = () => null;

const stageColumns = <T extends ChecklistTask>(
  tasks: T[],
  { stages, workflowNames }: BoardColumnData,
): BoardColumn<T>[] => {
  const stageById = new Map(stages.map((s) => [s.ID, s]));
  // Across projects, only the workflows the shown tasks use get columns.
  const workflows = workflowNames
    ? new Set(tasks.map((t) => stageById.get(t.Stage)?.Workflow))
    : null;
  const columns = stages
    .filter((s) => !workflows || workflows.has(s.Workflow))
    .sort((a, b) => a.Workflow - b.Workflow || a.Position - b.Position);
  return columns.map((stage) => ({
    key: `stage-${stage.ID}`,
    label: stage.Name,
    description: workflowNames ? workflowNames[stage.Workflow] : stage.Description,
    marker: <StageIcon stage={stage} />,
    color: stage.Color,
    tasks: tasks.filter((t) => t.Stage === stage.ID),
    changes: { Stage: stage.ID },
    rejects: (task) =>
      stageById.get(task.Stage)?.Workflow === stage.Workflow
        ? null
        : `“${stage.Name}” belongs to another workflow.`,
  }));
};

const priorityColumns = <T extends ChecklistTask>(tasks: T[]): BoardColumn<T>[] =>
  PRIORITIES.map((priority) => ({
    key: `priority-${priority}`,
    label: priority,
    marker: <TaskPriorityIcon variant={priority} />,
    color: "gray",
    tasks: tasks.filter((t) => t.Priority === priority),
    changes: { Priority: priority },
    rejects: accept,
  }));

const typeColumns = <T extends ChecklistTask>(
  tasks: T[],
  { taskTypes, categories }: BoardColumnData,
): BoardColumn<T>[] => {
  const categoryOrder = new Map(categories.map((c) => [c.ID, c.SortOrder]));
  const types = new Map(taskTypes.map((t) => [t.ID, t]));
  // A task whose type isn't in the list (still loading) keeps its own column.
  for (const task of tasks) if (!types.has(task.Type.ID)) types.set(task.Type.ID, task.Type);
  return [...types.values()]
    .sort(
      (a, b) =>
        (categoryOrder.get(a.Category) ?? 999) - (categoryOrder.get(b.Category) ?? 999) ||
        a.Name.localeCompare(b.Name),
    )
    .map((type) => ({
      key: `type-${type.ID}`,
      label: type.Name,
      description: type.Description,
      marker: (
        <DynamicIcon
          name={type.Icon as IconName}
          className={`size-4 ${stageStrokeClass(type.Color)}`}
          fallback={() => <span className="size-4" />}
        />
      ),
      color: type.Color,
      tasks: tasks.filter((t) => t.Type.ID === type.ID),
      changes: { Type: type },
      rejects: accept,
    }));
};

/** A board view's columns for its grouping. Unknown groupings fall back to stages. */
export const buildBoardColumns = <T extends ChecklistTask>(
  groupBy: GroupByKey | null,
  tasks: T[],
  data: BoardColumnData,
): BoardColumn<T>[] => {
  switch (groupBy) {
    case "priority":
      return priorityColumns(tasks);
    case "type":
      return typeColumns(tasks, data);
    default:
      return stageColumns(tasks, data);
  }
};
