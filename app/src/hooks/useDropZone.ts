import { useDroppable } from "@dnd-kit/core";

export function useDropZone(id: string, data?: Record<string, unknown>) {
  const { setNodeRef, isOver } = useDroppable({ id, data });
  return { setNodeRef, isOver };
}
