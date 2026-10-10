import { useEffect, useState } from "react";
import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import { restrictToVerticalAxis } from "@dnd-kit/modifiers";
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { toast } from "sonner";
import {
  SidebarGroup,
  SidebarGroupAction,
  SidebarGroupLabel,
  SidebarMenu,
} from "@/components/ui/sidebar";
import { usePinnedProjectsQuery } from "@/queries/usePinnedProjectsQuery";
import { useAllProjectsMutation } from "@/queries/useAllProjectsMutation";
import { PinnedProjectItem } from "@/components/sidebar/nav-pinned-projects/pinned-project-item";
import { DeleteProjectDialog } from "@/features/projects/delete-project-dialog";
import type { Project } from "@/types/types";

export function NavPinnedProjects() {
  const { data: pinnedProjects = [], isFetching } = usePinnedProjectsQuery();
  const { reorderPinnedProjects } = useAllProjectsMutation();

  const [isReordering, setIsReordering] = useState(false);
  const [items, setItems] = useState<Project[]>([]);
  const [projectToDelete, setProjectToDelete] = useState<Project | null>(null);

  useEffect(() => {
    setItems(pinnedProjects);
  }, [pinnedProjects]);

  // Reorder mode is meaningless with fewer than two pins, and leaving it on
  // after an unpin would strand the user in a mode with nothing to drag.
  useEffect(() => {
    if (items.length < 2) setIsReordering(false);
  }, [items.length]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const handleDragEnd = (e: DragEndEvent) => {
    const { active, over } = e;
    if (!over || active.id === over.id) return;

    const oldIndex = items.findIndex((p) => p.ID === active.id);
    const newIndex = items.findIndex((p) => p.ID === over.id);
    if (oldIndex === -1 || newIndex === -1) return;

    // Optimistic per the dnd drag-reorder carve-out; revert on error.
    const reordered = arrayMove(items, oldIndex, newIndex);
    setItems(reordered);

    reorderPinnedProjects.mutate(
      reordered.map((p) => p.ID),
      {
        onError: () => {
          setItems(pinnedProjects);
          toast.error("Failed to reorder pinned projects.");
        },
      },
    );
  };

  if (isFetching && items.length === 0) return null;

  const list = items.map((project) => (
    <PinnedProjectItem
      key={project.ID}
      project={project}
      isReordering={isReordering}
      onDelete={setProjectToDelete}
    />
  ));

  return (
    <>
      <SidebarGroup className="group-data-[collapsible=icon]:hidden">
        <SidebarGroupLabel>Pinned Projects</SidebarGroupLabel>
        {items.length > 1 && (
          <SidebarGroupAction
            // Overrides the icon-sized default so a text label fits.
            className="aspect-auto w-auto px-1.5 text-xs font-medium"
            onClick={() => setIsReordering((prev) => !prev)}
          >
            {isReordering ? "Done" : "Reorder"}
          </SidebarGroupAction>
        )}

        <SidebarMenu>
          {isReordering ? (
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              modifiers={[restrictToVerticalAxis]}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={items.map((p) => p.ID)}
                strategy={verticalListSortingStrategy}
              >
                {list}
              </SortableContext>
            </DndContext>
          ) : (
            list
          )}
        </SidebarMenu>
      </SidebarGroup>

      {projectToDelete && (
        <DeleteProjectDialog
          project={projectToDelete}
          open={projectToDelete !== null}
          onOpenChange={(open) => {
            if (!open) setProjectToDelete(null);
          }}
        />
      )}
    </>
  );
}
