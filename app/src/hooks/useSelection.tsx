import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import type {
  DragEndEvent,
  DragStartEvent,
  Over,
} from "@dnd-kit/core";
import {
  SelectionArea as ViselectArea,
  type SelectionEvent,
} from "@viselect/react";
import { cn } from "@/lib/utils";

type UseSelectionParams = {
  onDragWithSelection?: (
    selectedIds: Set<string>,
    dropTarget: Over | null,
  ) => void;
  clearOnDrop?: boolean;
};

type SelectionAreaProps = {
  children: ReactNode;
  className?: string;
};

type DragListeners = Record<string, (e: React.SyntheticEvent) => void>;

const hasModifier = (e: { ctrlKey?: boolean; metaKey?: boolean; shiftKey?: boolean }) =>
  !!(e.ctrlKey || e.metaKey || e.shiftKey);

export const useSelection = ({
  onDragWithSelection,
  clearOnDrop = true,
}: UseSelectionParams = {}) => {
  const [selectedIds, setSelectedIdsState] = useState<Set<string>>(
    () => new Set(),
  );
  const selectedIdsRef = useRef(selectedIds);

  const setSelectedIds = useCallback(
    (next: Set<string> | ((prev: Set<string>) => Set<string>)) => {
      setSelectedIdsState((prev) => {
        const value = typeof next === "function" ? next(prev) : next;
        selectedIdsRef.current = value;
        return value;
      });
    },
    [],
  );

  const isSelected = useCallback(
    (id: string) => selectedIdsRef.current.has(id),
    [],
  );

  const clearSelection = useCallback(
    () => setSelectedIds(new Set()),
    [setSelectedIds],
  );

  const getItemProps = useCallback(
    (id: string, opts?: { listeners?: DragListeners }) => {
      const sourceListeners = opts?.listeners;
      const wrappedListeners: DragListeners = {};
      if (sourceListeners) {
        for (const [key, handler] of Object.entries(sourceListeners)) {
          if (key === "onPointerDown") {
            wrappedListeners[key] = (e: React.SyntheticEvent) => {
              if (hasModifier(e as unknown as React.PointerEvent)) return;
              handler(e);
            };
          } else {
            wrappedListeners[key] = handler;
          }
        }
      }

      return {
        "data-id": id,
        "data-selected": (selectedIds.has(id) ? "" : undefined) as
          | ""
          | undefined,
        className: "selectable",
        ...wrappedListeners,
        onClick: (e: React.MouseEvent) => {
          if (hasModifier(e)) {
            e.preventDefault();
          } else {
            setSelectedIds(new Set());
          }
        },
      };
    },
    [selectedIds, setSelectedIds],
  );

  const handleBeforeStart = useCallback(
    (e: SelectionEvent): boolean | void => {
      const target = e.event?.target;
      const native = e.event;
      const modifierHeld =
        !!native && hasModifier(native as unknown as PointerEvent);
      if (
        !modifierHeld &&
        target instanceof Element &&
        target.closest("[data-task-card], [data-drag-handle]")
      ) {
        return false;
      }
    },
    [],
  );

  const handleStart = useCallback((e: SelectionEvent) => {
    const native = e.event;
    const isAppend =
      !!native &&
      "ctrlKey" in native &&
      (native.ctrlKey || native.metaKey);
    if (!isAppend) {
      e.selection.clearSelection();
    }
  }, []);

  useEffect(() => {
    const handler = (e: PointerEvent) => {
      if (!(e.target instanceof Element)) return;
      if (hasModifier(e)) return;
      if (e.target.closest(".selectable")) return;
      if (selectedIdsRef.current.size === 0) return;
      clearSelection();
    };
    document.addEventListener("pointerdown", handler);
    return () => document.removeEventListener("pointerdown", handler);
  }, [clearSelection]);

  const handleMove = useCallback(
    (e: SelectionEvent) => {
      setSelectedIds((prev) => {
        const next = new Set(prev);
        for (const el of e.store.changed.added) {
          const id = (el as HTMLElement).dataset.id;
          if (id) next.add(id);
        }
        for (const el of e.store.changed.removed) {
          const id = (el as HTMLElement).dataset.id;
          if (id) next.delete(id);
        }
        return next;
      });
    },
    [setSelectedIds],
  );

  const SelectionArea = useMemo(
    () =>
      function SelectionAreaWrapper({
        children,
        className,
      }: SelectionAreaProps) {
        return (
          <ViselectArea
            className={cn("select-none", className)}
            selectables=".selectable"
            onBeforeStart={handleBeforeStart}
            onStart={handleStart}
            onMove={handleMove}
          >
            {children}
          </ViselectArea>
        );
      },
    [handleBeforeStart, handleStart, handleMove],
  );

  const wrapDragStart = useCallback(
    (consumer: (e: DragStartEvent) => void) => (e: DragStartEvent) => {
      const activeId = String(e.active.id);
      if (!selectedIdsRef.current.has(activeId)) {
        setSelectedIds(new Set());
      }
      consumer(e);
    },
    [setSelectedIds],
  );

  const wrapDragEnd = useCallback(
    (consumer: (e: DragEndEvent) => void) => (e: DragEndEvent) => {
      const activeId = String(e.active.id);
      const current = selectedIdsRef.current;
      if (current.size > 1 && current.has(activeId)) {
        onDragWithSelection?.(new Set(current), e.over);
        if (clearOnDrop) clearSelection();
        return;
      }
      consumer(e);
    },
    [onDragWithSelection, clearOnDrop, clearSelection],
  );

  return {
    selectedIds,
    setSelectedIds,
    isSelected,
    clearSelection,
    SelectionArea,
    getItemProps,
    wrapDragStart,
    wrapDragEnd,
  };
};
