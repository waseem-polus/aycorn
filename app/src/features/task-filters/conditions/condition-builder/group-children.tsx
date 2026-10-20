import { Fragment } from "react";
import { useDroppable } from "@dnd-kit/core";
import { SortableContext, type SortingStrategy } from "@dnd-kit/sortable";
import { useConditionBuilder } from "@/features/task-filters/conditions/condition-builder-context";
import { AddNodeButtons } from "@/features/task-filters/conditions/condition-builder/add-node-buttons";
import { ConditionGroupBox } from "@/features/task-filters/conditions/condition-builder/condition-group-box";
import { ConditionRow } from "@/features/task-filters/conditions/condition-builder/condition-row";
import { DropLine } from "@/features/task-filters/conditions/condition-builder/drop-line";
import { LogicDivider } from "@/features/task-filters/conditions/condition-builder/logic-divider";
import { SortableNode } from "@/features/task-filters/conditions/condition-builder/sortable-node";
import { MAX_GROUP_DEPTH } from "@/features/task-filters/conditions/condition-tree-ops";
import type { ConditionGroup } from "@/features/task-filters/conditions/condition-types";

/** Siblings never shift while dragging; the drop line shows the landing spot instead. */
const noShift: SortingStrategy = () => null;

type Props = {
  group: ConditionGroup;
  depth: number;
  emptyText: string;
};

/**
 * A group's children separated by its AND / OR divider, followed by the add
 * buttons. The add-button row doubles as the "drop at the end" target, which
 * is also how a node gets into an empty group.
 */
export function GroupChildren({ group, depth, emptyText }: Props) {
  const { dropTarget } = useConditionBuilder();
  const { setNodeRef } = useDroppable({
    id: `end:${group.id}`,
    data: { groupId: group.id, end: true },
  });
  const isEndTarget = dropTarget?.groupId === group.id && dropTarget.overId === null;

  return (
    <SortableContext items={group.children.map((c) => c.id)} strategy={noShift}>
      <div className="flex flex-col gap-2">
        {group.children.map((child, i) => (
          <Fragment key={child.id}>
            {i > 0 && <LogicDivider match={group.match} />}
            <SortableNode id={child.id} groupId={group.id}>
              {(handle) =>
                child.kind === "group" ? (
                  <ConditionGroupBox group={child} depth={depth + 1} handle={handle} />
                ) : (
                  <ConditionRow condition={child} handle={handle} />
                )
              }
            </SortableNode>
          </Fragment>
        ))}
        <div ref={setNodeRef} className="relative flex flex-col gap-2 pt-0.5">
          {isEndTarget && <DropLine edge="top" />}
          {group.children.length === 0 && (
            <div className="rounded-md border border-dashed py-3 text-center text-sm text-muted-foreground">
              {emptyText}
            </div>
          )}
          <AddNodeButtons groupId={group.id} canAddGroup={depth < MAX_GROUP_DEPTH} />
        </div>
      </div>
    </SortableContext>
  );
}
