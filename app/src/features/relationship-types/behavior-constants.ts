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

export const BEHAVIOR_FROM_NAME_PLACEHOLDER: Record<
  RelationshipBehavior,
  string
> = {
  blocking: "Blocking Item",
  subtask: "Child Item",
  link: "Source Item",
};

export const BEHAVIOR_TO_NAME_PLACEHOLDER: Record<
  RelationshipBehavior,
  string
> = {
  blocking: "Blocked Item",
  subtask: "Parent Item",
  link: "Destination Item",
};
