import React, {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useRef,
  useState,
  useMemo,
} from "react";
import { toast } from "sonner";
import type { Task } from "@/types/types";
import { useCalendarHost } from "@/features/calendar/contexts/calendar-host-context";
import { useTaskMutation } from "@/queries/useTaskMutation";

interface DragDropContextType {
  draggedEvent: Task | null;
  isDragging: boolean;
  startDrag: (event: Task) => void;
  endDrag: () => void;
  handleEventDrop: (date: Date, hour?: number, minute?: number) => void;
}

interface DndProviderProps {
  children: ReactNode;
}

const DragDropContext = createContext<DragDropContextType | undefined>(
  undefined,
);

export function DndProvider({ children }: DndProviderProps) {
  const { projectId } = useCalendarHost();
  const { update } = useTaskMutation(projectId ?? 0);

  const [dragState, setDragState] = useState<{
    draggedEvent: Task | null;
    isDragging: boolean;
  }>({ draggedEvent: null, isDragging: false });

  const onEventDroppedRef = useRef<
    ((event: Task, newStartDate: Date, newEndDate: Date) => void) | null
  >(null);

  const startDrag = useCallback((event: Task) => {
    setDragState({ draggedEvent: event, isDragging: true });
  }, []);

  const endDrag = useCallback(() => {
    setDragState({ draggedEvent: null, isDragging: false });
  }, []);

  const calculateNewDates = useCallback(
    (event: Task, targetDate: Date, hour?: number, minute?: number) => {
      const originalStart = new Date(
        event.TimePlannedStart ?? event.TimeCreated,
      );
      const originalEnd = new Date(
        event.TimePlannedEnd ?? event.TimePlannedStart ?? event.TimeCreated,
      );
      const duration = originalEnd.getTime() - originalStart.getTime();

      const newStart = new Date(targetDate);
      if (hour !== undefined) {
        newStart.setHours(hour, minute || 0, 0, 0);
      } else {
        newStart.setHours(
          originalStart.getHours(),
          originalStart.getMinutes(),
          0,
          0,
        );
      }

      return {
        newStart,
        newEnd: new Date(newStart.getTime() + duration),
      };
    },
    [],
  );

  const isSamePosition = useCallback((date1: Date, date2: Date) => {
    return date1.getTime() === date2.getTime();
  }, []);

  const handleEventDrop = useCallback(
    (targetDate: Date, hour?: number, minute?: number) => {
      const { draggedEvent } = dragState;
      if (!draggedEvent) return;

      const { newStart, newEnd } = calculateNewDates(
        draggedEvent,
        targetDate,
        hour,
        minute,
      );
      const originalStart = new Date(
        draggedEvent.TimePlannedStart ?? draggedEvent.TimeCreated,
      );

      if (isSamePosition(originalStart, newStart)) {
        endDrag();
        return;
      }

      const callback = onEventDroppedRef.current;
      if (callback) {
        callback(draggedEvent, newStart, newEnd);
      }
      endDrag();
    },
    [dragState, calculateNewDates, isSamePosition, endDrag],
  );

  const handleEventUpdate = useCallback(
    (event: Task, newStartDate: Date, newEndDate: Date) => {
      const updatedEvent = {
        ...event,
        TimePlannedStart: newStartDate.toISOString(),
        TimePlannedEnd: newEndDate.toISOString(),
      };
      update.mutate(updatedEvent, {
        onSuccess: () => toast.success("Task updated successfully"),
        onError: () => toast.error("Failed to update task"),
      });
    },
    [update],
  );

  React.useEffect(() => {
    onEventDroppedRef.current = handleEventUpdate;
  }, [handleEventUpdate]);

  const contextValue = useMemo(
    () => ({
      draggedEvent: dragState.draggedEvent,
      isDragging: dragState.isDragging,
      startDrag,
      endDrag,
      handleEventDrop,
    }),
    [dragState, startDrag, endDrag, handleEventDrop],
  );

  return (
    <DragDropContext.Provider value={contextValue}>
      {children}
    </DragDropContext.Provider>
  );
}

export function useDragDrop() {
  const context = useContext(DragDropContext);
  if (!context) {
    throw new Error("useDragDrop must be used within a DragDropProvider");
  }
  return context;
}
