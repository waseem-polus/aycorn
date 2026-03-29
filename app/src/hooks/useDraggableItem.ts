import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";

export function useDraggableItem(id: string, data?: Record<string, unknown>) {
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({ id, data });

  const style = {
    transform: CSS.Translate.toString(transform),
    visibility: isDragging ? "hidden" : "visible",
    cursor: isDragging ? "grabbing" : "grab",
  };

  return { setNodeRef, style, listeners, attributes, isDragging };
}
