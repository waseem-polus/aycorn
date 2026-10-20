import { isComplete } from "@/features/task-filters/conditions/condition-tree-ops";
import type {
  Condition,
  ConditionGroup,
  WireCondition,
  WireGroup,
} from "@/features/task-filters/conditions/condition-types";
import { parseLocalDate, toApiDayEnd, toApiDayStart } from "@/utils/date";

/**
 * Local calendar days become UTC instants here, in the browser, because only
 * the browser knows which timezone the user picked the day in. The server
 * then just compares instants.
 */
const toWireCondition = (c: Condition): WireCondition => {
  const base = { property: c.property!, operator: c.operator! };
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
