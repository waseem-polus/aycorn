import { useDraggable } from "@dnd-kit/core";

export function useDraggableItem(id: string, data?: Record<string, unknown>) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id,
    data,
  });

  const style = {
    opacity: isDragging ? 0.3 : 1,
    pointerEvents: isDragging ? "none" : "auto",
    cursor: isDragging ? "grabbing" : "grab",
  };

  return { setNodeRef, style, listeners, attributes, isDragging };
}
