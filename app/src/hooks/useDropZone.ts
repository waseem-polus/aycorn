import { useDroppable, type UniqueIdentifier } from "@dnd-kit/core";

export function useDropZone(
  id: UniqueIdentifier,
  data?: Record<string, unknown>,
) {
  const { setNodeRef, isOver } = useDroppable({ id, data });
  return { setNodeRef, isOver };
}
