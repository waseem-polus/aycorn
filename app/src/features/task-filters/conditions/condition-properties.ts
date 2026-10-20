import {
  CalendarCheckIcon,
  CalendarIcon,
  FolderIcon,
  LandPlotIcon,
  Layers2Icon,
  ShapesIcon,
  SignalIcon,
  TextIcon,
  UserIcon,
  type LucideIcon,
} from "lucide-react";
import type {
  OperatorKey,
  PropertyKey,
} from "@/features/task-filters/conditions/condition-types";

export type PropertySection = "Project" | "Task" | "Dates";

export type PropertyMeta = {
  label: string;
  icon: LucideIcon;
  section: PropertySection;
  /** "enum" properties take their values from an OptionSource the drawer provides. */
  valueKind: "enum" | "date" | "text";
  /** In picker order; the first is the default when the property is chosen. */
  operators: OperatorKey[];
  /** Noun for the value picker's search placeholder ("Search priorities…"). */
  plural: string;
};

const ENUM_OPERATORS: OperatorKey[] = ["is", "is_not"];
const NULLABLE_ENUM_OPERATORS: OperatorKey[] = [...ENUM_OPERATORS, "is_empty", "is_not_empty"];
const DATE_OPERATORS: OperatorKey[] = ["on", "before", "after", "between", "is_set", "is_not_set"];

/**
 * Every property a condition can test — the Registry pattern. Adding a
 * property is an entry here plus the matching entry in the server's
 * `taskConditionProperties`; the pickers, editors and serializer all read
 * from this table. Must stay in sync with that server registry, which
 * validates every operator listed here.
 *
 * Checklist has no empty operators: task listings inner-join checklist, so a
 * task without one is never listed. Project, Status and Type are NOT NULL.
 */
export const PROPERTIES: Record<PropertyKey, PropertyMeta> = {
  project: {
    label: "Project",
    icon: FolderIcon,
    section: "Project",
    valueKind: "enum",
    operators: ENUM_OPERATORS,
    plural: "projects",
  },
  checklist: {
    label: "Checklist",
    icon: LandPlotIcon,
    section: "Project",
    valueKind: "enum",
    operators: ENUM_OPERATORS,
    plural: "checklists",
  },
  stage: {
    label: "Status",
    icon: Layers2Icon,
    section: "Task",
    valueKind: "enum",
    operators: ENUM_OPERATORS,
    plural: "statuses",
  },
  type: {
    label: "Type",
    icon: ShapesIcon,
    section: "Task",
    valueKind: "enum",
    operators: ENUM_OPERATORS,
    plural: "types",
  },
  assignee: {
    label: "Assignee",
    icon: UserIcon,
    section: "Task",
    valueKind: "enum",
    operators: NULLABLE_ENUM_OPERATORS,
    plural: "assignees",
  },
  priority: {
    label: "Priority",
    icon: SignalIcon,
    section: "Task",
    valueKind: "enum",
    operators: NULLABLE_ENUM_OPERATORS,
    plural: "priorities",
  },
  title: {
    label: "Title",
    icon: TextIcon,
    section: "Task",
    valueKind: "text",
    operators: ["contains", "does_not_contain"],
    plural: "titles",
  },
  timePlanned: {
    label: "Time Planned",
    icon: CalendarIcon,
    section: "Dates",
    valueKind: "date",
    operators: DATE_OPERATORS,
    plural: "dates",
  },
  timeCompleted: {
    label: "Time Completed",
    icon: CalendarCheckIcon,
    section: "Dates",
    valueKind: "date",
    operators: DATE_OPERATORS,
    plural: "dates",
  },
};

export const PROPERTY_SECTIONS: PropertySection[] = ["Project", "Task", "Dates"];

export const PROPERTY_KEYS = Object.keys(PROPERTIES) as PropertyKey[];
