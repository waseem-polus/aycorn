import { DateRangePicker } from "@/components/ui/date-range-picker";
import { useConditionBuilder } from "@/features/task-filters/conditions/condition-builder-context";
import { DateValueEditor } from "@/features/task-filters/conditions/condition-builder/date-value-editor";
import { EnumValueEditor } from "@/features/task-filters/conditions/condition-builder/enum-value-editor";
import { TextValueEditor } from "@/features/task-filters/conditions/condition-builder/text-value-editor";
import { OPERATORS } from "@/features/task-filters/conditions/condition-operators";
import { PROPERTIES } from "@/features/task-filters/conditions/condition-properties";
import type { Condition } from "@/features/task-filters/conditions/condition-types";

type Props = {
  condition: Condition;
  /** Whether this editor was just reached through the keyboard flow and should open. */
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

/** Renders the editor the operator needs, or nothing for presence checks. */
export function ValueEditor({ condition, open, onOpenChange }: Props) {
  const { tree, sources } = useConditionBuilder();
  const { id, property, operator, value } = condition;
  if (!property || !operator) return null;

  switch (OPERATORS[operator].arity) {
    case "none":
      return null;

    case "ids": {
      const source = sources[property];
      if (!source) return null;
      return (
        <EnumValueEditor
          source={source}
          plural={PROPERTIES[property].plural}
          selected={value?.kind === "ids" ? value.ids : []}
          open={open}
          onOpenChange={onOpenChange}
          onChange={(ids) => tree.setValue(id, ids.length ? { kind: "ids", ids } : null)}
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
