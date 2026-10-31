import { GripVerticalIcon, SquareDashedIcon } from "lucide-react";
import { useConditionBuilder } from "@/features/task-filters/conditions/condition-builder-context";
import { PropertyIcon } from "@/features/task-filters/conditions/condition-builder/property-icon";
import {
  operatorCopy,
  resolveProperty,
} from "@/features/task-filters/conditions/condition-properties";
import { countCompleteLeaves } from "@/features/task-filters/conditions/condition-tree-ops";
import type { ConditionNode } from "@/features/task-filters/conditions/condition-types";

/** The floating card that follows the pointer while a node is dragged. */
export function DragPreview({ node }: { node: ConditionNode }) {
  const { linkTypes } = useConditionBuilder();
  const summary = (() => {
    if (node.kind === "group") {
      const n = countCompleteLeaves(node);
      return (
        <>
          <SquareDashedIcon className="size-4 text-muted-foreground" />
          Group · {n} condition{n === 1 ? "" : "s"}
        </>
      );
    }
    const meta = node.property ? resolveProperty(node.property, linkTypes) : null;
    return (
      <>
        {meta && <PropertyIcon icon={meta.icon} className="size-4" />}
        {meta?.label ?? "New condition"}
        {meta && node.operator && (
          <span className="text-muted-foreground">{operatorCopy(meta, node.operator).label}</span>
        )}
      </>
    );
  })();

  return (
    <div className="flex cursor-grabbing items-center gap-2 rounded-lg border bg-background p-2 pr-4 text-sm shadow-lg">
      <GripVerticalIcon className="size-4 text-muted-foreground" />
      {summary}
    </div>
  );
}
