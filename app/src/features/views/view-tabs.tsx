import { useEffect, useRef, useState } from "react";
import {
  closestCenter,
  DndContext,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import { restrictToHorizontalAxis } from "@dnd-kit/modifiers";
import {
  arrayMove,
  horizontalListSortingStrategy,
  SortableContext,
} from "@dnd-kit/sortable";
import { useHotkeys } from "@tanstack/react-hotkeys";
import { PlusIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverAnchor } from "@/components/ui/popover";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import type { ConditionOptionSources } from "@/features/task-filters/conditions/condition-builder-context";
import { DeleteViewDialog } from "@/features/views/delete-view-dialog";
import type { BoardViewsAPI } from "@/features/views/hooks/useBoardViews";
import { useViewShortcuts } from "@/features/views/hooks/useViewShortcuts";
import { useVisibleTabs } from "@/features/views/hooks/useVisibleTabs";
import { ViewSettingsPopover } from "@/features/views/view-settings-popover";
import { useViewSettings } from "@/features/views/view-settings-context";
import { ViewOverflowMenu } from "@/features/views/view-tabs/view-overflow-menu";
import { ViewSelectMobile } from "@/features/views/view-tabs/view-select-mobile";
import { ViewTab } from "@/features/views/view-tabs/view-tab";
import type { BoardView } from "@/features/views/view-types";
import { useIsMobile } from "@/hooks/useMobile";

type Props = {
  api: BoardViewsAPI;
  selectedId: number | null;
  onSelect: (id: number) => void;
  /** The values the data-source editor offers on this board. */
  sources: ConditionOptionSources;
};

/**
 * A board's views as a tab strip: select, drag to reorder, edit a view's
 * settings in place, and [+] to add one. A roving tablist — ←/→ move, Enter
 * on the selected tab toggles its settings — plus Alt+Shift+1…9. Right-click
 * opens a tab's context menu. Tabs that don't fit collapse into a `+N` menu;
 * on mobile the strip is a dropdown instead.
 *
 * Which view's settings are open is shared (see `ViewSettingsProvider`) so the
 * toolbar's settings button can toggle them.
 */
export function ViewTabs({ api, selectedId, onSelect, sources }: Props) {
  const { views } = api;
  const isMobile = useIsMobile();
  const { editingId, setEditingId } = useViewSettings();
  // Which view is being renamed in its tab.
  const [renamingId, setRenamingId] = useState<number | null>(null);
  // Switching to another view (tab click, shortcut, URL) closes the editor.
  useEffect(() => {
    if (editingId !== null && editingId !== selectedId) setEditingId(null);
  }, [selectedId, editingId, setEditingId]);
  const [deleting, setDeleting] = useState<BoardView | null>(null);
  const [focusIndex, setFocusIndex] = useState<number | null>(null);
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const rowRef = useRef<HTMLDivElement | null>(null);
  const tablistRef = useRef<HTMLDivElement | null>(null);
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
  );

  useViewShortcuts(
    views.map((v) => v.ID),
    onSelect,
  );

  const visibleIds = useVisibleTabs({
    rowRef,
    tabButtons: tabRefs,
    ids: views.map((v) => v.ID),
    selectedId,
    enabled: !isMobile,
  });
  const isShown = (index: number) =>
    visibleIds === null || visibleIds.has(views[index].ID);
  const hiddenViews = views.filter((_, i) => !isShown(i));

  const selectedIndex = Math.max(views.findIndex((v) => v.ID === selectedId), 0);
  const tabStop =
    focusIndex !== null && focusIndex < views.length && isShown(focusIndex)
      ? focusIndex
      : selectedIndex;

  // ←/→/Home/End move focus between the tabs on show, from whichever has it.
  const focusFrom = (from: number, delta: -1 | 1) => {
    for (let i = from + delta; i >= 0 && i < views.length; i += delta) {
      if (isShown(i)) {
        tabRefs.current[i]?.focus();
        return;
      }
    }
  };
  useHotkeys(
    [
      { hotkey: "ArrowRight", callback: () => focusFrom(tabStop, 1) },
      { hotkey: "ArrowLeft", callback: () => focusFrom(tabStop, -1) },
      { hotkey: "Home", callback: () => focusFrom(-1, 1) },
      { hotkey: "End", callback: () => focusFrom(views.length, -1) },
    ],
    { target: tablistRef },
  );

  const move = (id: number, delta: -1 | 1) => {
    const ids = views.map((v) => v.ID);
    const from = ids.indexOf(id);
    const to = from + delta;
    if (to < 0 || to >= ids.length) return;
    api.reorder(arrayMove(ids, from, to));
  };

  const onDragEnd = ({ active, over }: DragEndEvent) => {
    if (!over || active.id === over.id) return;
    const ids = views.map((v) => v.ID);
    api.reorder(arrayMove(ids, ids.indexOf(Number(active.id)), ids.indexOf(Number(over.id))));
  };

  /**
   * Create-empty-then-edit: a new list view, selected — with its name ready to
   * type on a tab, or its settings open on mobile (which has no tab to rename).
   */
  const addView = async () => {
    const created = await api.create("list");
    if (!created) return;
    onSelect(created.ID);
    if (isMobile) setEditingId(created.ID);
    else setRenamingId(created.ID);
  };

  const duplicate = async (id: number) => {
    const created = await api.duplicate(id);
    if (created) onSelect(created.ID);
  };

  const confirmDelete = async () => {
    if (!deleting) return;
    const index = views.findIndex((v) => v.ID === deleting.ID);
    const removed = await api.remove(deleting.ID);
    setDeleting(null);
    if (!removed || deleting.ID !== selectedId) return;
    const neighbour = views[index + 1] ?? views[index - 1];
    if (neighbour) onSelect(neighbour.ID);
  };

  const deleteDialog = deleting && (
    <DeleteViewDialog
      view={deleting}
      open
      onOpenChange={(open) => !open && setDeleting(null)}
      onConfirm={() => void confirmDelete()}
    />
  );

  if (isMobile) {
    const selectedView = views.find((v) => v.ID === selectedId);
    return (
      <>
        {/* The settings popover is a sibling of the dropdown, so clicks in it
            don't bubble into the menu's handlers. */}
        <Popover
          open={selectedView !== undefined && editingId === selectedView.ID}
          onOpenChange={(open) => !open && setEditingId(null)}
        >
          <PopoverAnchor asChild>
            <div className="min-w-0">
              <ViewSelectMobile
                views={views}
                selectedId={selectedId}
                onSelect={onSelect}
                onAdd={() => void addView()}
                onOpenSettings={() => selectedId !== null && setEditingId(selectedId)}
              />
            </div>
          </PopoverAnchor>
          {selectedView && editingId === selectedView.ID && (
            <ViewSettingsPopover
              view={selectedView}
              api={api}
              sources={sources}
              onDuplicate={() => {
                setEditingId(null);
                void duplicate(selectedView.ID);
              }}
              onDelete={() => {
                setEditingId(null);
                setDeleting(selectedView);
              }}
            />
          )}
        </Popover>
        {deleteDialog}
      </>
    );
  }

  return (
    <div ref={rowRef} className="flex min-w-0 items-center gap-1">
      <div
        ref={tablistRef}
        role="tablist"
        aria-label="Views"
        className="relative flex min-w-0 items-center gap-0.5 overflow-hidden rounded-lg bg-muted p-[3px]"
      >
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          modifiers={[restrictToHorizontalAxis]}
          onDragEnd={onDragEnd}
        >
          <SortableContext items={views.map((v) => v.ID)} strategy={horizontalListSortingStrategy}>
            {views.map((view, i) => (
              <ViewTab
                key={view.ID}
                view={view}
                api={api}
                sources={sources}
                selected={view.ID === selectedId}
                focusable={tabStop === i}
                shortcut={i < 9 ? i + 1 : null}
                isFirst={i === 0}
                isLast={i === views.length - 1}
                overflowed={!isShown(i)}
                editing={editingId === view.ID}
                onEditingChange={(open) => setEditingId(open ? view.ID : null)}
                renaming={renamingId === view.ID}
                onRenamingChange={(on) => setRenamingId(on ? view.ID : null)}
                tabRef={(el) => {
                  tabRefs.current[i] = el;
                }}
                onSelect={() => onSelect(view.ID)}
                onFocus={() => setFocusIndex(i)}
                onMove={(delta) => move(view.ID, delta)}
                onDuplicate={() => void duplicate(view.ID)}
                onDelete={() => setDeleting(view)}
              />
            ))}
          </SortableContext>
        </DndContext>

        {hiddenViews.length > 0 && (
          <ViewOverflowMenu
            views={hiddenViews}
            onSelect={onSelect}
            onAdd={() => void addView()}
          />
        )}
      </div>

      {hiddenViews.length === 0 && (
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="size-8 shrink-0"
              aria-label="Add a view"
              onClick={() => void addView()}
            >
              <PlusIcon />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Add a view</TooltipContent>
        </Tooltip>
      )}

      {deleteDialog}
    </div>
  );
}
