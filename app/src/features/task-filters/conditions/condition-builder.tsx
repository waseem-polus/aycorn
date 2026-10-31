import { useState } from "react";
import { createPortal } from "react-dom";
import {
  closestCenter,
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  pointerWithin,
  useSensor,
  useSensors,
  type CollisionDetection,
  type DragMoveEvent,
} from "@dnd-kit/core";
import { sortableKeyboardCoordinates } from "@dnd-kit/sortable";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  ConditionBuilderContext,
  type ConditionOptionSources,
  type DropTarget,
} from "@/features/task-filters/conditions/condition-builder-context";
import { DragPreview } from "@/features/task-filters/conditions/condition-builder/drag-preview";
import { GroupChildren } from "@/features/task-filters/conditions/condition-builder/group-children";
import { MatchToggle } from "@/features/task-filters/conditions/condition-builder/match-toggle";
import {
  containsNode,
  findNode,
  fitsAtDepth,
  groupDepth,
} from "@/features/task-filters/conditions/condition-tree-ops";
import type { ConditionGroup } from "@/features/task-filters/conditions/condition-types";
import type { ConditionTreeAPI } from "@/features/task-filters/conditions/hooks/useConditionTree";
import { useLinkConditionData } from "@/features/task-filters/conditions/hooks/useLinkConditionData";

type Props = {
  tree: ConditionTreeAPI;
  sources: ConditionOptionSources;
};

/** Every droppable carries the group it belongs to; end zones also flag `end`. */
type DropData = { groupId: string; end?: boolean };

/**
 * The "Conditions" section of a filter drawer: header, root match toggle,
 * and the tree. Owns drag and drop for the whole tree so nodes can move
 * between groups, not just within one.
 */
export function ConditionBuilder({ tree, sources }: Props) {
  const { root } = tree;
  const { linkTypes, linkTaskSource } = useLinkConditionData();
  const [activeId, setActiveId] = useState<string | null>(null);
  const [dropTarget, setDropTarget] = useState<DropTarget | null>(null);
  const activeNode = activeId ? (findNode(root, activeId)?.node ?? null) : null;

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  /**
   * Nested sortables overlap, so take the innermost droppable under the
   * pointer (smallest area) — a row inside a group beats the group itself.
   * A dragged group can't be dropped into its own subtree, so those targets
   * are filtered out first. Keyboard drags have no pointer and fall back to
   * the closest center.
   */
  const collisionDetection: CollisionDetection = (args) => {
    const droppableContainers = args.droppableContainers.filter((c) => {
      if (!activeNode) return true;
      const data = c.data.current as DropData | undefined;
      const targetId = data?.end ? data.groupId : String(c.id);
      return !containsNode(activeNode, targetId);
    });
    const scoped = { ...args, droppableContainers };
    const within = pointerWithin(scoped);
    if (within.length === 0) return closestCenter(scoped);
    const area = (id: string | number) => {
      const rect = args.droppableRects.get(id);
      return rect ? rect.width * rect.height : Infinity;
    };
    return within.sort((a, b) => area(a.id) - area(b.id));
  };

  const trackDropTarget = ({ active, over }: DragMoveEvent) => {
    const data = over?.data.current as DropData | undefined;
    if (!over || !data || !activeNode) return setDropTarget(null);
    if (!fitsAtDepth(activeNode, groupDepth(root, data.groupId))) return setDropTarget(null);
    if (data.end) return setDropTarget({ groupId: data.groupId, overId: null, after: false });
    const dragged = active.rect.current.translated;
    const after = dragged
      ? dragged.top + dragged.height / 2 > over.rect.top + over.rect.height / 2
      : false;
    setDropTarget({ groupId: data.groupId, overId: String(over.id), after });
  };

  const finishDrag = () => {
    const target = dropTarget;
    const id = activeId;
    setActiveId(null);
    setDropTarget(null);
    if (!target || !id) return;

    const source = findNode(root, id);
    const group = findNode(root, target.groupId)?.node as ConditionGroup | undefined;
    if (!source?.parent || !group) return;

    // The target index is in the group as it is now; moveNode wants it as it
    // will be once the node is lifted out of its current spot.
    let index = target.overId
      ? group.children.findIndex((c) => c.id === target.overId) + (target.after ? 1 : 0)
      : group.children.length;
    if (source.parent.id === target.groupId && source.index < index) index -= 1;
    tree.move(id, target.groupId, index);
  };

  return (
    <ConditionBuilderContext.Provider
      value={{ tree, sources, linkTypes, linkTaskSource, activeId, dropTarget }}
    >
      <section className="flex flex-col gap-3" data-vaul-no-drag>
        <div className="flex flex-col gap-1">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Conditions</span>
              {tree.completeCount > 0 && (
                <Badge variant="secondary">{tree.completeCount}</Badge>
              )}
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 text-muted-foreground"
              disabled={root.children.length === 0}
              onClick={tree.clearAll}
            >
              Clear all
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            Combined with the basic filters above using AND.
          </p>
        </div>

        <DndContext
          sensors={sensors}
          collisionDetection={collisionDetection}
          onDragStart={({ active }) => setActiveId(String(active.id))}
          onDragMove={trackDropTarget}
          onDragOver={trackDropTarget}
          onDragEnd={finishDrag}
          onDragCancel={() => {
            setActiveId(null);
            setDropTarget(null);
          }}
        >
          {root.children.length > 1 && (
            <MatchToggle value={root.match} onChange={(m) => tree.setMatch(root.id, m)} />
          )}
          <GroupChildren
            group={root}
            depth={1}
            emptyText="No conditions yet. Add one to filter by any property."
          />
          {/* The drawer is CSS-transformed, which would offset a fixed-position
              overlay rendered inside it; portal it to the body instead. */}
          {createPortal(
            <DragOverlay className="z-[60]">
              {activeNode && <DragPreview node={activeNode} />}
            </DragOverlay>,
            document.body,
          )}
        </DndContext>
      </section>
    </ConditionBuilderContext.Provider>
  );
}
