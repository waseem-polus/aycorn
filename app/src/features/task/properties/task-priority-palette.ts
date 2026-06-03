import type { Task } from "@/types/types";
import { stageStrokeClass } from "@/features/stage/stage-palette";

// Priority → stage-palette color name. Reuses the stage palette so priority
// icons get the same dark-mode-safe stroke treatment as stages and task types,
// instead of hardcoding single-shade Tailwind colors.
const PRIORITY_COLOR: Record<Task["Priority"], string> = {
  Low: "blue",
  Medium: "yellow",
  High: "orange",
  Urgent: "red",
};

export const priorityStrokeClass = (priority: Task["Priority"]) =>
  stageStrokeClass(PRIORITY_COLOR[priority]);
