import { useDraggable } from "@dnd-kit/core";
import type { CSSProperties } from "react";

export function useDraggableItem(id: string, data?: Record<string, unknown>) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id,
    data,
  });

  const style: CSSProperties = {
    opacity: isDragging ? "0.3" : undefined,
    pointerEvents: isDragging ? "none" : "auto",
    cursor: isDragging ? "grabbing" : "grab",
  };

  return { setNodeRef, style, listeners, attributes, isDragging };
}
