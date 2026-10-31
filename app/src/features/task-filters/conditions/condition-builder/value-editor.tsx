import { DateRangePicker } from "@/components/ui/date-range-picker";
import { useConditionBuilder } from "@/features/task-filters/conditions/condition-builder-context";
import { DateValueEditor } from "@/features/task-filters/conditions/condition-builder/date-value-editor";
import { EnumValueEditor } from "@/features/task-filters/conditions/condition-builder/enum-value-editor";
import { TextValueEditor } from "@/features/task-filters/conditions/condition-builder/text-value-editor";
import {
  LINK_ANY,
  LINK_NONE,
  OPERATORS,
} from "@/features/task-filters/conditions/condition-operators";
import { resolveProperty } from "@/features/task-filters/conditions/condition-properties";
import type { Condition, StaticPropertyKey } from "@/features/task-filters/conditions/condition-types";

type Props = {
  condition: Condition;
  /** Whether this editor was just reached through the keyboard flow and should open. */
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

const SENTINELS: (string | number)[] = [LINK_ANY, LINK_NONE];

/**
 * "Any task" and "No task" stand alone: picking one replaces the selection,
 * and picking a real task drops whichever sentinel was there.
 */
const exclusiveLinkIds = (prev: (string | number)[], next: (string | number)[]) => {
  const added = next.find((k) => !prev.includes(k));
  if (added === undefined) return next;
  return SENTINELS.includes(added) ? [added] : next.filter((k) => !SENTINELS.includes(k));
};

/** Renders the editor the operator needs, or nothing for presence checks. */
export function ValueEditor({ condition, open, onOpenChange }: Props) {
  const { tree, sources, linkTypes, linkTaskSource } = useConditionBuilder();
  const { id, property, operator, value } = condition;
  if (!property || !operator) return null;
  const meta = resolveProperty(property, linkTypes);

  switch (OPERATORS[operator].arity) {
    case "none":
      return null;

    case "ids": {
      const isLink = meta.valueKind === "link";
      const source = isLink ? linkTaskSource : sources[property as StaticPropertyKey];
      if (!source) return null;
      const selected = value?.kind === "ids" ? value.ids : [];
      return (
        <EnumValueEditor
          source={source}
          plural={meta.plural}
          selected={selected}
          open={open}
          onOpenChange={onOpenChange}
          onChange={(next) => {
            const ids = isLink ? exclusiveLinkIds(selected, next) : next;
            tree.setValue(id, ids.length ? { kind: "ids", ids } : null);
          }}
        />
      );
    }

    case "date":
      return (
        <DateValueEditor
          date={value?.kind === "date" ? value.date : ""}
          open={open}
          onOpenChange={onOpenChange}
          onChange={(date) => tree.setValue(id, { kind: "date", date })}
        />
      );

    case "range":
      return (
        <DateRangePicker
          mode="date"
          placeholder="Pick a range"
          from={value?.kind === "range" ? value.from || null : null}
          to={value?.kind === "range" ? value.to || null : null}
          onRangeChange={(from, to) =>
            tree.setValue(
              id,
              from || to ? { kind: "range", from: from ?? "", to: to ?? "" } : null,
            )
          }
        />
      );

    case "text":
      return (
        <TextValueEditor
          text={value?.kind === "text" ? value.text : ""}
          autoFocus={open}
          onChange={(text) => tree.setValue(id, text ? { kind: "text", text } : null)}
        />
      );
  }
}
