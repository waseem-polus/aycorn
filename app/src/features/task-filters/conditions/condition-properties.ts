import {
  CalendarCheckIcon,
  CalendarIcon,
  FolderIcon,
  FolderPenIcon,
  LandPlotIcon,
  Layers2Icon,
  Link2Icon,
  ListTodoIcon,
  ShapesIcon,
  SignalIcon,
  SquareStackIcon,
  TextIcon,
  UserIcon,
  type LucideIcon,
} from "lucide-react";
import type {
  LinkDirection,
  LinkPropertyKey,
  OperatorKey,
  PropertyKey,
  StaticPropertyKey,
} from "@/features/task-filters/conditions/condition-types";
import { OPERATORS } from "@/features/task-filters/conditions/condition-operators";
import type { TaskRelationshipType } from "@/types/types";

export type PropertySection = "Project" | "Task" | "Dates" | "Links";

/** A registry icon, or a relationship type's own lucide name + palette color. */
export type PropertyIconSpec = LucideIcon | { name: string; color: string };

export type PropertyMeta = {
  label: string;
  icon: PropertyIconSpec;
  section: PropertySection;
  /**
   * Picks the value editor. "enum" takes its values from an OptionSource the
   * drawer provides; "link" from the cross-project task list; "presence"
   * properties have no value at all.
   */
  valueKind: "enum" | "date" | "text" | "presence" | "link";
  /** In picker order; the first is the default when the property is chosen. */
  operators: OperatorKey[];
  /** Noun for the value picker's search placeholder ("Search priorities…"). */
  plural: string;
  /** Rewording of shared operators where the generic copy reads badly ("Task links are empty"). */
  operatorOverrides?: Partial<Record<OperatorKey, { label: string; description: string }>>;
  /**
   * Only offered where the drawer provides this other property's source — the
   * project page has no Project source, so Project name is hidden there too.
   */
  requiresSource?: StaticPropertyKey;
};

const ENUM_OPERATORS: OperatorKey[] = ["is", "is_not"];
const NULLABLE_ENUM_OPERATORS: OperatorKey[] = [...ENUM_OPERATORS, "is_empty", "is_not_empty"];
const TEXT_OPERATORS: OperatorKey[] = ["contains", "does_not_contain", "equals", "not_equals"];
const DATE_OPERATORS: OperatorKey[] = ["on", "before", "after", "between", "is_set", "is_not_set"];
const LINK_OPERATORS: OperatorKey[] = ["is", "is_not"];

/**
 * Every fixed property a condition can test — the Registry pattern. Adding a
 * property is an entry here plus the matching entry in the server's
 * `taskConditionProperties`; the pickers, editors and serializer all read
 * from this table. Must stay in sync with that server registry, which
 * validates every operator listed here.
 *
 * Checklist has no empty operators: task listings inner-join checklist, so a
 * task without one is never listed. Project, Status and Type are NOT NULL.
 * Per-direction link properties aren't here — see `resolveProperty`.
 */
export const STATIC_PROPERTIES: Record<StaticPropertyKey, PropertyMeta> = {
  project: {
    label: "Project",
    icon: FolderIcon,
    section: "Project",
    valueKind: "enum",
    operators: [...ENUM_OPERATORS, "is_archived", "is_not_archived"],
    plural: "projects",
  },
  projectName: {
    label: "Project name",
    icon: FolderPenIcon,
    section: "Project",
    valueKind: "text",
    operators: TEXT_OPERATORS,
    plural: "project names",
    requiresSource: "project",
  },
  checklist: {
    label: "Checklist",
    icon: LandPlotIcon,
    section: "Project",
    valueKind: "enum",
    operators: ENUM_OPERATORS,
    plural: "checklists",
  },
  checklistName: {
    label: "Checklist name",
    icon: ListTodoIcon,
    section: "Project",
    valueKind: "text",
    operators: TEXT_OPERATORS,
    plural: "checklist names",
  },
  stage: {
    label: "Status",
    icon: Layers2Icon,
    section: "Task",
    valueKind: "enum",
    operators: ENUM_OPERATORS,
    plural: "statuses",
  },
  stageType: {
    label: "Stage category",
    icon: SquareStackIcon,
    section: "Task",
    valueKind: "enum",
    operators: ENUM_OPERATORS,
    plural: "categories",
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
  // Stored as `title` since phase 1; only the label changed.
  title: {
    label: "Task name",
    icon: TextIcon,
    section: "Task",
    valueKind: "text",
    operators: TEXT_OPERATORS,
    plural: "names",
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
  taskLinks: {
    label: "Task links",
    icon: Link2Icon,
    section: "Links",
    valueKind: "presence",
    operators: ["is_empty", "is_not_empty"],
    plural: "links",
    operatorOverrides: {
      is_empty: { label: "are empty", description: "No links of any kind" },
      is_not_empty: { label: "are not empty", description: "At least one link of any kind" },
    },
  },
};

export const PROPERTY_SECTIONS: PropertySection[] = ["Project", "Task", "Dates", "Links"];

export const STATIC_PROPERTY_KEYS = Object.keys(STATIC_PROPERTIES) as StaticPropertyKey[];

/* ------------------------------------------------------------------ *
 * Link properties — one per direction of each relationship type
 * ------------------------------------------------------------------ */

export const linkPropertyKey = (typeId: number, direction: LinkDirection): LinkPropertyKey =>
  `link:${typeId}:${direction}`;

export const parseLinkPropertyKey = (key: PropertyKey) => {
  const match = /^link:(\d+):(from|to)$/.exec(key);
  return match ? { typeId: Number(match[1]), direction: match[2] as LinkDirection } : null;
};

/** Every link property the given relationship types produce, both directions each. */
export const linkPropertyKeys = (types: TaskRelationshipType[]): LinkPropertyKey[] =>
  types.flatMap((t) => [linkPropertyKey(t.ID, "from"), linkPropertyKey(t.ID, "to")]);

/** Operators don't depend on relationship type data, so tree edits can stay pure. */
export const operatorsFor = (key: PropertyKey): OperatorKey[] =>
  parseLinkPropertyKey(key) ? LINK_OPERATORS : STATIC_PROPERTIES[key as StaticPropertyKey].operators;

/**
 * The display metadata for any property. Link properties take their label,
 * icon and color from the relationship type; a type deleted since the
 * condition was made still resolves, as "Deleted link".
 */
export const resolveProperty = (
  key: PropertyKey,
  linkTypes: TaskRelationshipType[],
): PropertyMeta => {
  const link = parseLinkPropertyKey(key);
  if (!link) return STATIC_PROPERTIES[key as StaticPropertyKey];

  const type = linkTypes.find((t) => t.ID === link.typeId);
  return {
    label: type ? (link.direction === "from" ? type.FromName : type.ToName) : "Deleted link",
    icon: type ? { name: type.Icon, color: type.Color } : Link2Icon,
    section: "Links",
    valueKind: "link",
    operators: LINK_OPERATORS,
    plural: "tasks",
  };
};

/** An operator's label and description as this property phrases them. */
export const operatorCopy = (meta: PropertyMeta, op: OperatorKey) =>
  meta.operatorOverrides?.[op] ?? OPERATORS[op];
