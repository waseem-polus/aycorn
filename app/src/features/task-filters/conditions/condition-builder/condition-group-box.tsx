import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { useConditionBuilder } from "@/features/task-filters/conditions/condition-builder-context";
import { GroupChildren } from "@/features/task-filters/conditions/condition-builder/group-children";
import { MatchToggle } from "@/features/task-filters/conditions/condition-builder/match-toggle";
import { NodeActionsMenu } from "@/features/task-filters/conditions/condition-builder/node-actions-menu";
import type { ConditionGroup } from "@/features/task-filters/conditions/condition-types";

type Props = {
  group: ConditionGroup;
  /** This group's depth; the root is 1, so a box is always 2 or deeper. */
  depth: number;
  handle: ReactNode;
};

/** A nested group: its match toggle and menu, then its children. Deeper levels alternate surfaces so nesting stays legible. */
export function ConditionGroupBox({ group, depth, handle }: Props) {
  const { tree, dropTarget } = useConditionBuilder();
  const { setMatch } = tree;
  const isDropTarget = dropTarget?.groupId === group.id;

  return (
    <div
      className={cn(
        "flex flex-col gap-2 rounded-lg border p-2 transition-colors",
        depth % 2 === 0 ? "bg-muted/60" : "bg-background",
        isDropTarget && "border-primary/50 bg-primary/5",
      )}
    >
      <div className="flex items-center gap-1.5">
        {handle}
        <MatchToggle value={group.match} onChange={(m) => setMatch(group.id, m)} />
        <div className="ml-auto">
          <NodeActionsMenu nodeId={group.id} kind="group" />
        </div>
      </div>
      <GroupChildren group={group} depth={depth} emptyText="No conditions in this group" />
    </div>
  );
}
