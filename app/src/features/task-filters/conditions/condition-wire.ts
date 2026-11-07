import { parseLinkPropertyKey } from "@/features/task-filters/conditions/condition-properties";
import { isComplete } from "@/features/task-filters/conditions/condition-tree-ops";
import type {
  Condition,
  ConditionGroup,
  StaticPropertyKey,
  WireCondition,
  WireGroup,
} from "@/features/task-filters/conditions/condition-types";
import {
  resolveDateRef,
  type DateContext,
} from "@/features/task-filters/conditions/relative-dates";
import { toApiDayEnd, toApiDayStart } from "@/utils/date";

/** Link properties travel as `taskLink` plus the relationship type and direction. */
const wireProperty = (c: Condition): Pick<WireCondition, "property" | "linkType" | "direction"> => {
  const link = parseLinkPropertyKey(c.property!);
  return link
    ? { property: "taskLink", linkType: link.typeId, direction: link.direction }
    : { property: c.property as StaticPropertyKey };
};

/**
 * Local calendar days become UTC instants here, in the browser, because only
 * the browser knows which timezone the user picked the day in. Relative dates
 * are resolved against `ctx.today` here too, so the server just compares
 * instants and never needs to know a date was relative.
 */
const toWireCondition = (c: Condition, ctx: DateContext): WireCondition => {
  const base: WireCondition = { ...wireProperty(c), operator: c.operator! };
  const v = c.value;
  if (!v) return base;
  switch (v.kind) {
    case "ids":
      return { ...base, values: v.ids };
    case "text":
      return { ...base, text: v.text.trim() };
    case "range":
      // isComplete guarantees both ends before a condition is sent.
      return {
        ...base,
        from: toApiDayStart(resolveDateRef(v.from!, ctx).start),
        to: toApiDayEnd(resolveDateRef(v.to!, ctx).end),
      };
    case "date": {
      const span = resolveDateRef(v.ref, ctx);
      // Overlap semantics: before = before the span's first instant, after =
      // after its last instant, on = anywhere in it. A single day is a
      // one-day span, so "on This week" and "on Nov 4" work the same way.
      if (c.operator === "before") return { ...base, at: toApiDayStart(span.start) };
      if (c.operator === "after") return { ...base, at: toApiDayEnd(span.end) };
      return { ...base, from: toApiDayStart(span.start), to: toApiDayEnd(span.end) };
    }
  }
};

const toWireGroup = (group: ConditionGroup, ctx: DateContext): WireGroup | null => {
  const children: WireGroup["children"] = [];
  for (const child of group.children) {
    if (child.kind === "group") {
      const sub = toWireGroup(child, ctx);
      if (sub) children.push(sub);
    } else if (isComplete(child)) {
      children.push(toWireCondition(child, ctx));
    }
  }
  return children.length > 0 ? { match: group.match, children } : null;
};

/**
 * The server payload for a tree: ids dropped, incomplete conditions and
 * groups left empty by them stripped, so a half-built row never changes the
 * results. Null when nothing applies. `ctx` pins relative dates to a day.
 */
export const toWire = (root: ConditionGroup, ctx: DateContext): WireGroup | null =>
  toWireGroup(root, ctx);

const treeControlsArchived = (group: WireGroup): boolean =>
  group.children.some((c) =>
    "match" in c
      ? treeControlsArchived(c)
      : c.property === "project" && (c.operator === "is_archived" || c.operator === "is_not_archived"),
  );

/**
 * Whether any of the trees decides archived-project visibility. /upcoming
 * hides archived projects' tasks by default, unless a condition takes control.
 */
export const controlsArchived = (trees: WireGroup[]): boolean => trees.some(treeControlsArchived);
