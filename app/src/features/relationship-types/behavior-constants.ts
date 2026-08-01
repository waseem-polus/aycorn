import type { RelationshipBehavior } from "@/types/types";

export const BEHAVIOR_COLOR: Record<RelationshipBehavior, string> = {
  blocking: "red",
  subtask: "emerald",
  link: "purple",
};

export const BEHAVIOR_LABEL: Record<RelationshipBehavior, string> = {
  blocking: "Blocking",
  subtask: "Subtask",
  link: "Link",
};
