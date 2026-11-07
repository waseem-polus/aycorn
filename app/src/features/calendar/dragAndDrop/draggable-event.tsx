import { motion } from "framer-motion";
import type React from "react";
import type { ReactNode } from "react";
import { useDragDrop } from "@/features/calendar/contexts/dnd-context";
import { useCalendarHost } from "@/features/calendar/contexts/calendar-host-context";
import type { Task } from "@/types/types";

interface DraggableEventProps {
  event: Task;
  children: ReactNode;
  className?: string;
}

export function DraggableEvent({
  event,
  children,
  className,
}: DraggableEventProps) {
  const { startDrag, endDrag, isDragging, draggedEvent } = useDragDrop();
  const { reschedulable } = useCalendarHost();

  const isCurrentlyDragged = isDragging && draggedEvent?.ID === event.ID;

  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
  };

  // Calendars placing tasks by a historical date (created, completed, …)
  // are read-only: the task still opens, it just can't be moved.
  if (!reschedulable) {
    return (
      <div className={className} data-task-card="" onClick={handleClick}>
        {children}
      </div>
    );
  }

  return (
    <motion.div
      className={`${className || ""} ${isCurrentlyDragged ? "opacity-50 cursor-grabbing" : "cursor-grab"}`}
      draggable
      // Without this, PageContent's SelectionArea draws a selection rectangle
      // while the event is being dragged.
      data-task-card=""
      onClick={(e: React.MouseEvent<HTMLDivElement>) => handleClick(e)}
      onDragStart={(e) => {
        (e as DragEvent).dataTransfer!.setData(
          "text/plain",
          event.ID.toString(),
        );
        startDrag(event);
      }}
      onDragEnd={() => {
        endDrag();
      }}
    >
      {children}
    </motion.div>
  );
}
