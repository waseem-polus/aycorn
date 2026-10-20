import { GripVerticalIcon, SquareDashedIcon } from "lucide-react";
import { OPERATORS } from "@/features/task-filters/conditions/condition-operators";
import { PROPERTIES } from "@/features/task-filters/conditions/condition-properties";
import { countCompleteLeaves } from "@/features/task-filters/conditions/condition-tree-ops";
import type { ConditionNode } from "@/features/task-filters/conditions/condition-types";

/** The floating card that follows the pointer while a node is dragged. */
export function DragPreview({ node }: { node: ConditionNode }) {
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
    const meta = node.property ? PROPERTIES[node.property] : null;
    return (
      <>
        {meta && <meta.icon className="size-4 text-muted-foreground" />}
        {meta?.label ?? "New condition"}
        {node.operator && (
          <span className="text-muted-foreground">{OPERATORS[node.operator].label}</span>
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
