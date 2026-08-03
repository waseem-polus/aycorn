import { useEffect, useMemo, useState } from "react";
import type React from "react";
import {
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useDraggable,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragOverEvent,
  type DragStartEvent,
  type DropAnimation,
  type Over,
} from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { FolderPlus, GripVertical, Search } from "lucide-react";
import { toast } from "sonner";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import { Button } from "@/components/ui/button";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { useAllProjectsQuery } from "@/queries/useAllProjectsQuery";
import { useAllProjectsMutation } from "@/queries/useAllProjectsMutation";
import { useProjectFoldersQuery } from "@/features/projects/queries/useProjectFoldersQuery";
import { useProjectFolderMutation } from "@/features/projects/queries/useProjectFolderMutation";
import { ProjectCard } from "@/features/projects/project-card";
import { ProjectFolderSection } from "@/features/projects/project-folder-section";
import { ProjectsBulkActionsToolbar } from "@/features/projects/projects-bulk-actions-toolbar";
import { NewProjectButton } from "@/features/projects/new-project-button";
import { useSharedSelection } from "@/hooks/useSelection";
import { bulkResultToast } from "@/features/workflows/shared/bulk-result-toast";
import type { Project, ProjectFolder } from "@/types/types";

const successDropAnimation: DropAnimation = {
  duration: 200,
  easing: "ease-out",
  keyframes: ({ transform }) => [
    { opacity: 1, transform: CSS.Transform.toString(transform.initial) },
    { opacity: 0, transform: CSS.Transform.toString(transform.initial) },
  ],
};

const cancelDropAnimation: DropAnimation = { duration: 250, easing: "ease" };

type DragListeners = Record<string, (e: React.SyntheticEvent) => void>;

type ArchiveFilter = "open" | "archived";

function DraggableProjectCard({
  project,
  folders,
}: {
  project: Project;
  folders: ProjectFolder[];
}) {
  const { getItemProps } = useSharedSelection();
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `proj-${project.ID}`,
    data: { type: "project", projectId: project.ID },
  });

  // Desktop drags the whole card; touch drags only the grip handle.
  const { onTouchStart, ...pointerListeners } = (listeners ?? {}) as {
    onTouchStart?: React.TouchEventHandler;
  } & DragListeners;

  const itemProps = getItemProps(`proj-${project.ID}`, {
    listeners: pointerListeners,
  });

  return (
    <ProjectCard
      project={project}
      folders={folders}
      dragRef={setNodeRef}
      dragStyle={{ opacity: isDragging ? 0.4 : 1 }}
      dragAttributes={attributes as unknown as Record<string, unknown>}
      itemProps={itemProps}
    >
      <button
        type="button"
        data-drag-handle=""
        aria-label="Drag to move to another folder"
        onTouchStart={onTouchStart}
        onClick={(e) => {
          e.stopPropagation();
          e.preventDefault();
        }}
        style={{ touchAction: "none" }}
        className="hidden pointer-coarse:flex cursor-grab text-muted-foreground p-1 rounded hover:bg-accent"
      >
        <GripVertical className="size-4" />
      </button>
    </ProjectCard>
  );
}

export function ProjectsPage() {
  const [search, setSearch] = useState("");
  const [archiveFilter, setArchiveFilter] = useState<ArchiveFilter>("open");
  const archivedView = archiveFilter === "archived";

  const { data: projects = [], isFetching: projectsFetching } =
    useAllProjectsQuery(archivedView);
  const { data: folders = [], isFetching: foldersFetching } =
    useProjectFoldersQuery();
  const { bulkSetFolder } = useAllProjectsMutation();
  const { createFolder, reorderFolders } = useProjectFolderMutation();
  const { wrapDragStart, wrapDragEnd } = useSharedSelection();

  const [orderedFolders, setOrderedFolders] = useState<ProjectFolder[]>([]);
  const [activeDragId, setActiveDragId] = useState<string | null>(null);
  const [dragOverFolderId, setDragOverFolderId] = useState<number | null>(null);
  // projectId -> optimistic folder while a (single or bulk) move is in flight.
  const [pendingFolderMoves, setPendingFolderMoves] = useState<
    Record<number, number>
  >({});
  const [dropResult, setDropResult] = useState<"success" | "cancel" | null>(
    null,
  );

  useEffect(() => {
    setOrderedFolders(folders);
  }, [folders]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const projectsByFolder = useMemo(() => {
    const map = new Map<number, Project[]>();
    for (const project of projects) {
      const folder = pendingFolderMoves[project.ID] ?? project.Folder;
      const bucket = map.get(folder) ?? [];
      bucket.push(project);
      map.set(folder, bucket);
    }
    return map;
  }, [projects, pendingFolderMoves]);

  const filteredByFolder = useMemo(() => {
    if (!search) return projectsByFolder;
    const q = search.toLowerCase();
    const filtered = new Map<number, Project[]>();
    for (const [folderId, folderProjects] of projectsByFolder) {
      const matching = folderProjects.filter((p) =>
        p.Name.toLowerCase().includes(q),
      );
      if (matching.length > 0) filtered.set(folderId, matching);
    }
    return filtered;
  }, [projectsByFolder, search]);

  const clearPendingMoves = (ids: number[]) =>
    setPendingFolderMoves((prev) => {
      const next = { ...prev };
      for (const id of ids) delete next[id];
      return next;
    });

  const handleDragStart = (e: DragStartEvent) => {
    setActiveDragId(String(e.active.id));
    setDropResult(null);
  };

  const handleDragOver = (e: DragOverEvent) => {
    const activeId = String(e.active.id);
    const overId = e.over ? String(e.over.id) : null;

    if (
      activeId.startsWith("folder-") &&
      overId?.startsWith("folder-") &&
      activeId !== overId
    ) {
      setOrderedFolders((prev) => {
        const oldIndex = prev.findIndex((f) => `folder-${f.ID}` === activeId);
        const newIndex = prev.findIndex((f) => `folder-${f.ID}` === overId);
        if (oldIndex === -1 || newIndex === -1) return prev;
        return arrayMove(prev, oldIndex, newIndex);
      });
    }

    if (overId?.startsWith("folder-") && activeId.startsWith("proj-")) {
      setDragOverFolderId(parseInt(overId.slice(7)));
    } else {
      setDragOverFolderId(null);
    }
  };

  const handleDragEnd = (e: DragEndEvent) => {
    const { active, over } = e;
    const activeId = String(active.id);
    setActiveDragId(null);
    setDragOverFolderId(null);

    if (!over) {
      if (activeId.startsWith("proj-")) setDropResult("cancel");
      return;
    }

    const overId = String(over.id);

    if (activeId.startsWith("folder-") && overId.startsWith("folder-")) {
      reorderFolders.mutate(
        orderedFolders.map((f) => f.ID),
        {
          onError: () => {
            setOrderedFolders(folders);
            toast.error("Failed to reorder folders.");
          },
        },
      );
    } else if (activeId.startsWith("proj-") && overId.startsWith("folder-")) {
      const projectId = parseInt(activeId.slice(5));
      const newFolderId = parseInt(overId.slice(7));
      const project = projects.find((p) => p.ID === projectId);
      if (!project || project.Folder === newFolderId) {
        setDropResult("cancel");
        return;
      }

      setDropResult("success");
      setPendingFolderMoves((prev) => ({ ...prev, [projectId]: newFolderId }));
      bulkSetFolder.mutate(
        { ids: [projectId], folder: newFolderId },
        {
          onSettled: () => clearPendingMoves([projectId]),
          onError: () => toast.error("Failed to move project."),
        },
      );
    }
  };

  // Bulk drag: move every selected project onto the dropped-on folder in one
  // request (no fan-out). Optimistic per the dnd drag-move carve-out.
  const handleBulkMoveToFolder = (ids: Set<string>, over: Over | null) => {
    setActiveDragId(null);
    setDragOverFolderId(null);

    const overId = over ? String(over.id) : null;
    if (!overId?.startsWith("folder-")) {
      setDropResult("cancel");
      return;
    }
    const newFolderId = parseInt(overId.slice(7));
    const projectIds = Array.from(ids)
      .filter((id) => id.startsWith("proj-"))
      .map((id) => parseInt(id.slice(5)))
      .filter((pid) => {
        const p = projects.find((x) => x.ID === pid);
        return p !== undefined && p.Folder !== newFolderId;
      });

    if (projectIds.length === 0) {
      setDropResult("cancel");
      return;
    }

    setDropResult("success");
    setPendingFolderMoves((prev) => {
      const next = { ...prev };
      for (const pid of projectIds) next[pid] = newFolderId;
      return next;
    });
    bulkSetFolder.mutate(
      { ids: projectIds, folder: newFolderId },
      {
        onSuccess: (result) =>
          bulkResultToast(
            result,
            `Moved ${result.success} project${result.success !== 1 ? "s" : ""}.`,
          ),
        onError: () => toast.error("Failed to move projects."),
        onSettled: () => clearPendingMoves(projectIds),
      },
    );
  };

  const handleDragCancel = () => {
    setActiveDragId(null);
    setDragOverFolderId(null);
    setDropResult("cancel");
  };

  const activeDragProject = projects.find(
    (p) => activeDragId === `proj-${p.ID}`,
  );

  const handleCreateFolder = () =>
    createFolder.mutate(undefined, {
      onError: () => toast.error("Failed to create folder."),
    });

  const isLoading =
    (projectsFetching && projects.length === 0) ||
    (foldersFetching && folders.length === 0);

  const visibleFolders = orderedFolders.filter(
    (f) => !search || filteredByFolder.has(f.ID),
  );

  const totalFilteredCount = useMemo(
    () =>
      Array.from(filteredByFolder.values()).reduce((n, ps) => n + ps.length, 0),
    [filteredByFolder],
  );

  return (
    <div className="flex flex-col gap-4 flex-1 min-h-0">
      <div className="flex gap-2 items-center flex-col md:flex-row">
        <InputGroup>
          <InputGroupInput
            placeholder="Filter Projects..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <InputGroupAddon>
            <Search />
          </InputGroupAddon>
          <InputGroupAddon align="inline-end">
            {search
              ? `${totalFilteredCount} projects`
              : `${projects.length} projects`}
          </InputGroupAddon>
        </InputGroup>

        {/* Wraps because this row carries three controls — without it the last
            button is clipped off-screen on narrow viewports. */}
        <div className="flex flex-wrap gap-2 justify-start sm:justify-end w-full md:w-fit md:shrink-0">
          <ToggleGroup
            type="single"
            variant="outline"
            value={archiveFilter}
            onValueChange={(v) =>
              setArchiveFilter((v || "open") as ArchiveFilter)
            }
          >
            <ToggleGroupItem value="open">Open</ToggleGroupItem>
            <ToggleGroupItem value="archived">Archived</ToggleGroupItem>
          </ToggleGroup>
          <Button
            variant="outline"
            onClick={handleCreateFolder}
            disabled={createFolder.isPending}
          >
            <FolderPlus />
            New Folder
          </Button>
          <NewProjectButton />
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center rounded-lg border border-dashed py-12 text-sm text-muted-foreground">
          Loading projects...
        </div>
      ) : visibleFolders.length === 0 && search ? (
        <div className="flex items-center justify-center rounded-lg border border-dashed py-12 text-sm text-muted-foreground">
          No projects match your search.
        </div>
      ) : archivedView && projects.length === 0 ? (
        <div className="flex items-center justify-center rounded-lg border border-dashed py-12 text-sm text-muted-foreground">
          No archived projects.
        </div>
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={wrapDragStart(handleDragStart)}
          onDragOver={handleDragOver}
          onDragEnd={wrapDragEnd(handleDragEnd, handleBulkMoveToFolder)}
          onDragCancel={handleDragCancel}
        >
          <SortableContext
            items={orderedFolders.map((f) => `folder-${f.ID}`)}
            strategy={verticalListSortingStrategy}
          >
            <div className="flex flex-col gap-2 flex-1 min-h-0 overflow-y-auto">
              {orderedFolders.length === 0 ? (
                <div className="flex items-center justify-center rounded-lg border border-dashed py-12 text-sm text-muted-foreground">
                  No projects yet.
                </div>
              ) : (
                visibleFolders.map((folder) => (
                  <ProjectFolderSection
                    key={folder.ID}
                    folder={folder}
                    allFolders={orderedFolders}
                    projects={filteredByFolder.get(folder.ID) ?? []}
                    isDropTarget={
                      dragOverFolderId === folder.ID &&
                      activeDragId?.startsWith("proj-") === true
                    }
                    renderProjectCard={(project) => (
                      <DraggableProjectCard
                        key={project.ID}
                        project={project}
                        folders={orderedFolders}
                      />
                    )}
                  />
                ))
              )}
            </div>
          </SortableContext>

          <DragOverlay
            dropAnimation={
              dropResult === "success"
                ? successDropAnimation
                : dropResult === "cancel"
                  ? cancelDropAnimation
                  : null
            }
          >
            {activeDragProject ? (
              <div className="opacity-90 rotate-1 pointer-events-none">
                <ProjectCard
                  project={activeDragProject}
                  folders={orderedFolders}
                />
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>
      )}

      <ProjectsBulkActionsToolbar
        projects={projects}
        folders={orderedFolders}
        archivedView={archivedView}
      />
    </div>
  );
}
