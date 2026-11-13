import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { useEffect, useState, type ReactNode } from "react";
import { useConditionBuilder } from "@/features/task-filters/conditions/condition-builder-context";
import { NodeActionsMenu } from "@/features/task-filters/conditions/condition-builder/node-actions-menu";
import { OperatorPicker } from "@/features/task-filters/conditions/condition-builder/operator-picker";
import { PropertyPicker } from "@/features/task-filters/conditions/condition-builder/property-picker";
import { ValueEditor } from "@/features/task-filters/conditions/condition-builder/value-editor";
import { OPERATORS } from "@/features/task-filters/conditions/condition-operators";
import { isComplete } from "@/features/task-filters/conditions/condition-tree-ops";
import { STATIC_PROPERTIES } from "@/features/task-filters/conditions/condition-properties";
import type {
  Condition,
  DateSpan,
  StaticPropertyKey,
} from "@/features/task-filters/conditions/condition-types";

type OpenPicker = "property" | "operator" | "value" | null;

type Props = {
  condition: Condition;
  handle: ReactNode;
};

/**
 * One condition: [grip] [property] [operator] [⋯] with the value editor
 * beneath. Choosing a property opens the operator, and choosing an operator
 * opens the value editor, so a condition can be built start to finish from
 * the keyboard.
 */
export function ConditionRow({ condition, handle }: Props) {
  const { tree } = useConditionBuilder();
  const { id, property, operator } = condition;
  const [openPicker, setOpenPicker] = useState<OpenPicker>(() =>
    tree.autoOpenId === id ? "property" : null,
  );

  // A freshly added condition opens its property picker once; clear the flag
  // so it doesn't reopen when the row remounts after a move or wrap.
  const { autoOpenId, clearAutoOpen } = tree;
  useEffect(() => {
    if (autoOpenId === id) clearAutoOpen();
  }, [autoOpenId, id, clearAutoOpen]);

  const pickerProps = (picker: Exclude<OpenPicker, null>) => ({
    open: openPicker === picker,
    onOpenChange: (open: boolean) => setOpenPicker(open ? picker : null),
  });

  const needsValue = !!operator && OPERATORS[operator].arity !== "none";
  // Window properties (Time Planned) can require the whole window to match.
  const showSpan =
    needsValue &&
    ["date", "range"].includes(OPERATORS[operator!].arity) &&
    !!property &&
    !!STATIC_PROPERTIES[property as StaticPropertyKey]?.spansRange;
  const pending = !!operator && !isComplete(condition) && openPicker === null;

  return (
    <div className="flex flex-col gap-2 rounded-lg border bg-background p-2 shadow-xs">
      <div className="flex items-center gap-1.5">
        {handle}
        <PropertyPicker
          value={property}
          {...pickerProps("property")}
          onSelect={(next) => {
            tree.setProperty(id, next);
            setOpenPicker("operator");
          }}
        />
        <OperatorPicker
          property={property}
          value={operator}
          {...pickerProps("operator")}
          onSelect={(next) => {
            tree.setOperator(id, next);
            setOpenPicker(OPERATORS[next].arity === "none" ? null : "value");
          }}
        />
        <NodeActionsMenu nodeId={id} kind="condition" />
      </div>
      {needsValue && (
        <div className="flex flex-col gap-1 pr-9.5 pl-6.5">
          <ValueEditor condition={condition} {...pickerProps("value")} />
          {showSpan && (
            <ToggleGroup
              type="single"
              variant="outline"
              size="sm"
              value={condition.span ?? "any"}
              onValueChange={(v) => v && tree.setSpan(id, v as DateSpan)}
              aria-label="Date span"
              className="self-start"
            >
              <ToggleGroupItem value="any" className="px-3">
                Any part
              </ToggleGroupItem>
              <ToggleGroupItem value="entire" className="px-3">
                Entire range
              </ToggleGroupItem>
            </ToggleGroup>
          )}
          {pending && (
            <span className="px-1 text-xs text-muted-foreground">
              Not applied until a value is set
            </span>
          )}
        </div>
      )}
    </div>
  );
}
