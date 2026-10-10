import type { Task, TaskType } from "@/types/types";

/**
 * The type every selected task shares, or undefined when the selection is mixed.
 *
 * Task.Type is an object, so the generic identity-comparing sharedValue helpers
 * in the bulk toolbars always report "mixed" for it. Compare by ID instead.
 */
export function sharedTaskType(
  tasks: Pick<Task, "Type">[],
): TaskType | undefined {
  if (tasks.length === 0) return undefined;
  const firstId = tasks[0].Type?.ID;
  return tasks.every((t) => t.Type?.ID === firstId) ? tasks[0].Type : undefined;
}

/**
 * Bulk changes travel as Partial<Task> so optimistic cache patches stay
 * well-shaped, but PUT /api/task/bulk writes raw columns — Type must go over
 * the wire as its numeric id. Convert only at the fetch boundary.
 */
export function toWireChanges(changes: Partial<Task>): Record<string, unknown> {
  const { Type, ...rest } = changes;
  return Type === undefined ? rest : { ...rest, Type: Type.ID };
}

/** Whether a bulk change would be a no-op for this task. */
export function isUnchangedBy(task: Task, changes: Partial<Task>): boolean {
  return Object.entries(changes).every(([key, value]) =>
    key === "Type"
      ? task.Type?.ID === (value as TaskType | undefined)?.ID
      : task[key as keyof Task] === value,
  );
}
