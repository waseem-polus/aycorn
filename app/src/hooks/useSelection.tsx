import { useCallback, useMemo, useRef, useState, type ReactNode } from "react";
import type { DragEndEvent, Over } from "@dnd-kit/core";
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

  const getSelectionProps = useCallback(
    (id: string) => ({
      "data-id": id,
      "data-selected": (selectedIds.has(id) ? "" : undefined) as
        | ""
        | undefined,
      className: "selectable",
    }),
    [selectedIds],
  );

  const handleBeforeStart = useCallback(
    (e: SelectionEvent): boolean | void => {
      const target = e.event?.target;
      if (
        target instanceof Element &&
        target.closest("[data-task-card], [data-drag-handle]")
      ) {
        return false;
      }
    },
    [],
  );

  const handleStart = useCallback(
    (e: SelectionEvent) => {
      const native = e.event;
      const isAppend =
        !!native &&
        "ctrlKey" in native &&
        (native.ctrlKey || native.metaKey);
      // TODO: range-select via Shift — placeholder for future implementation
      if (!isAppend) {
        setSelectedIds(new Set());
      }
    },
    [setSelectedIds],
  );

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

  const handleStop = useCallback(() => {}, []);

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
            onStop={handleStop}
          >
            {children}
          </ViselectArea>
        );
      },
    [handleBeforeStart, handleStart, handleMove, handleStop],
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
    getSelectionProps,
    wrapDragEnd,
  };
};
