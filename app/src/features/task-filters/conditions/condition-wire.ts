import { parseLinkPropertyKey } from "@/features/task-filters/conditions/condition-properties";
import { isComplete } from "@/features/task-filters/conditions/condition-tree-ops";
import type {
  Condition,
  ConditionGroup,
  StaticPropertyKey,
  WireCondition,
  WireGroup,
} from "@/features/task-filters/conditions/condition-types";
import { parseLocalDate, toApiDayEnd, toApiDayStart } from "@/utils/date";

/** Link properties travel as `taskLink` plus the relationship type and direction. */
const wireProperty = (c: Condition): Pick<WireCondition, "property" | "linkType" | "direction"> => {
  const link = parseLinkPropertyKey(c.property!);
  return link
    ? { property: "taskLink", linkType: link.typeId, direction: link.direction }
    : { property: c.property as StaticPropertyKey };
};

/**
 * Local calendar days become UTC instants here, in the browser, because only
 * the browser knows which timezone the user picked the day in. The server
 * then just compares instants.
 */
const toWireCondition = (c: Condition): WireCondition => {
  const base: WireCondition = { ...wireProperty(c), operator: c.operator! };
  const v = c.value;
  if (!v) return base;
  switch (v.kind) {
    case "ids":
      return { ...base, values: v.ids };
    case "text":
      return { ...base, text: v.text.trim() };
    case "range":
      return {
        ...base,
        from: toApiDayStart(parseLocalDate(v.from)),
        to: toApiDayEnd(parseLocalDate(v.to)),
      };
    case "date": {
      const day = parseLocalDate(v.date);
      // Overlap semantics: before a day = before its first instant, after a
      // day = after its last instant, on a day = the whole day.
      if (c.operator === "before") return { ...base, at: toApiDayStart(day) };
      if (c.operator === "after") return { ...base, at: toApiDayEnd(day) };
      return { ...base, from: toApiDayStart(day), to: toApiDayEnd(day) };
    }
  }
};

const toWireGroup = (group: ConditionGroup): WireGroup | null => {
  const children: WireGroup["children"] = [];
  for (const child of group.children) {
    if (child.kind === "group") {
      const sub = toWireGroup(child);
      if (sub) children.push(sub);
    } else if (isComplete(child)) {
      children.push(toWireCondition(child));
    }
  }
  return children.length > 0 ? { match: group.match, children } : null;
};

/**
 * The server payload for a tree: ids dropped, incomplete conditions and
 * groups left empty by them stripped, so a half-built row never changes the
 * results. Null when nothing applies.
 */
export const toWire = (root: ConditionGroup): WireGroup | null => toWireGroup(root);

/**
 * Whether the tree itself decides archived-project visibility. /upcoming hides
 * archived projects' tasks by default, unless a condition here takes control.
 */
export const controlsArchived = (group: WireGroup | null): boolean =>
  !!group &&
  group.children.some((c) =>
    "match" in c
      ? controlsArchived(c)
      : c.property === "project" && (c.operator === "is_archived" || c.operator === "is_not_archived"),
  );
