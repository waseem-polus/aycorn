import { useRef, useState } from "react";
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
import { PlusIcon, Settings2Icon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import type { ConditionOptionSources } from "@/features/task-filters/conditions/condition-builder-context";
import { DeleteViewDialog } from "@/features/views/delete-view-dialog";
import type { BoardViewsAPI } from "@/features/views/hooks/useBoardViews";
import { useViewShortcuts } from "@/features/views/hooks/useViewShortcuts";
import { ViewTab, type TabEditing } from "@/features/views/view-tabs/view-tab";
import type { BoardView } from "@/features/views/view-types";

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
 * opens a tab's context menu.
 */
export function ViewTabs({ api, selectedId, onSelect, sources }: Props) {
  const { views } = api;
  const [editing, setEditing] = useState<({ id: number } & NonNullable<TabEditing>) | null>(null);
  // Switching to another view (tab click, shortcut, URL) closes the editor.
  const [lastSelectedId, setLastSelectedId] = useState(selectedId);
  if (lastSelectedId !== selectedId) {
    setLastSelectedId(selectedId);
    if (editing && editing.id !== selectedId) setEditing(null);
  }
  const [deleting, setDeleting] = useState<BoardView | null>(null);
  const [focusIndex, setFocusIndex] = useState<number | null>(null);
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const tablistRef = useRef<HTMLDivElement | null>(null);
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
  );

  useViewShortcuts(
    views.map((v) => v.ID),
    onSelect,
  );

  const selectedIndex = Math.max(views.findIndex((v) => v.ID === selectedId), 0);
  const tabStop = Math.min(focusIndex ?? selectedIndex, Math.max(views.length - 1, 0));

  // ←/→/Home/End move focus between tabs, from whichever tab has it.
  const focusTab = (index: number) => {
    tabRefs.current[Math.min(Math.max(index, 0), views.length - 1)]?.focus();
  };
  useHotkeys(
    [
      { hotkey: "ArrowRight", callback: () => focusTab(tabStop + 1) },
      { hotkey: "ArrowLeft", callback: () => focusTab(tabStop - 1) },
      { hotkey: "Home", callback: () => focusTab(0) },
      { hotkey: "End", callback: () => focusTab(views.length - 1) },
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

  /** Create-empty-then-edit: a new list view, selected, with its name ready to type. */
  const addView = async () => {
    const created = await api.create("list");
    if (!created) return;
    onSelect(created.ID);
    setEditing({ id: created.ID, focus: "name" });
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

  return (
    <div className="flex min-w-0 items-center gap-1">
      <div
        ref={tablistRef}
        role="tablist"
        aria-label="Views"
        className="flex min-w-0 items-center gap-0.5 overflow-x-auto rounded-lg bg-muted p-[3px]"
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
                editing={editing?.id === view.ID ? { focus: editing.focus } : null}
                onEditingChange={(next) => setEditing(next ? { id: view.ID, ...next } : null)}
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
      </div>

      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="size-8 shrink-0"
            aria-label="View settings"
            data-view-settings-toggle=""
            disabled={selectedId === null}
            onClick={() => {
              if (selectedId === null) return;
              setEditing(editing ? null : { id: selectedId, focus: null });
            }}
          >
            <Settings2Icon />
          </Button>
        </TooltipTrigger>
        <TooltipContent>View settings</TooltipContent>
      </Tooltip>

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

      {deleting && (
        <DeleteViewDialog
          view={deleting}
          open
          onOpenChange={(open) => !open && setDeleting(null)}
          onConfirm={() => void confirmDelete()}
        />
      )}
    </div>
  );
}
