import type { OperatorKey } from "@/features/task-filters/conditions/condition-types";

/** What kind of value an operator needs, which picks the value editor. */
export type OperatorArity = "none" | "ids" | "date" | "range" | "text";

type OperatorMeta = {
  label: string;
  description: string;
  arity: OperatorArity;
};

export const OPERATORS: Record<OperatorKey, OperatorMeta> = {
  is: {
    label: "is",
    description: "Matches any of the chosen values",
    arity: "ids",
  },
  is_not: {
    label: "is not",
    description: "Anything except the chosen values",
    arity: "ids",
  },
  is_empty: { label: "is empty", description: "Nothing is set", arity: "none" },
  is_not_empty: {
    label: "is not empty",
    description: "Something is set",
    arity: "none",
  },
  before: {
    label: "before",
    description: "Falls before the date",
    arity: "date",
  },
  after: {
    label: "after",
    description: "Falls after the date",
    arity: "date",
  },
  on: { label: "on", description: "Falls on the date", arity: "date" },
  between: {
    label: "between",
    description: "Falls in the range",
    arity: "range",
  },
  is_set: { label: "is set", description: "Has a date", arity: "none" },
  is_not_set: {
    label: "is not set",
    description: "Has no date",
    arity: "none",
  },
  contains: {
    label: "contains",
    description: "Includes the text",
    arity: "text",
  },
  does_not_contain: {
    label: "does not contain",
    description: "Doesn't include the text",
    arity: "text",
  },
  equals: {
    label: "is",
    description: "Exactly the text, ignoring case",
    arity: "text",
  },
  not_equals: {
    label: "is not",
    description: "Anything but the text, ignoring case",
    arity: "text",
  },
  is_archived: {
    label: "is archived",
    description: "The project is archived",
    arity: "none",
  },
  is_not_archived: {
    label: "is not archived",
    description: "The project is active",
    arity: "none",
  },
};

/** Operators that test for presence rather than compare a value — listed after a separator in the picker. */
export const PRESENCE_OPERATORS: OperatorKey[] = [
  "is_empty",
  "is_not_empty",
  "is_set",
  "is_not_set",
  "is_archived",
  "is_not_archived",
];

/** The value sentinels for link properties, offered above the task list. */
export const LINK_ANY = "any";
export const LINK_NONE = "none";
