import React, { useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  ChevronDown,
  ChevronRight,
  ChevronsDownUp,
  ChevronsUpDown,
  GripVertical,
  MoreHorizontal,
  Trash2Icon,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { EditableHeader } from "@/components/EditableHeader";
import { useFocusAndSelect } from "@/hooks/useFocusAndSelect";
import { DeleteProjectFolderDialog } from "@/features/projects/delete-project-folder-dialog";
import { useProjectFolderMutation } from "@/features/projects/queries/useProjectFolderMutation";
import { folderName } from "@/features/projects/folder-name";
import { cn } from "@/lib/utils";
import type { Project, ProjectFolder } from "@/types/types";

type Props = {
  folder: ProjectFolder;
  allFolders: ProjectFolder[];
  projects: Project[];
  isDropTarget: boolean;
  collapsed: boolean;
  onToggleCollapsed: () => void;
  archivedView: boolean;
  visibleFolderIds: number[];
  emptyFolderIds: number[];
  nonEmptyFolderIds: number[];
  collapseFolders: (ids: number[]) => void;
  expandFolders: (ids: number[]) => void;
  renderProjectCard: (project: Project) => React.ReactNode;
};

export function ProjectFolderSection({
  folder,
  allFolders,
  projects,
  isDropTarget,
  collapsed,
  onToggleCollapsed,
  archivedView,
  visibleFolderIds,
  emptyFolderIds,
  nonEmptyFolderIds,
  collapseFolders,
  expandFolders,
  renderProjectCard,
}: Props) {
  const [isEditingName, setIsEditingName] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const nameRef = useRef<HTMLHeadingElement>(null);

  const { updateFolder } = useProjectFolderMutation();

  useFocusAndSelect(nameRef, isEditingName);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: `folder-${folder.ID}`,
    data: { type: "folder", folderId: folder.ID },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const handleSaveName = (newName: string) => {
    setIsEditingName(false);
    if (newName !== folder.Name) {
      updateFolder.mutate(
        { id: folder.ID, name: newName },
        { onError: () => toast.error("Failed to rename folder.") },
      );
    }
  };

  return (
    <>
      <div
        ref={setNodeRef}
        style={style}
        className={cn(
          "flex flex-col gap-2 rounded-lg border border-transparent py-1 transition-colors",
          isDragging && "opacity-50",
          isDropTarget && !isDragging && "border-primary/40 bg-primary/5",
        )}
      >
        {/* Header */}
        <div className="flex items-center gap-1">
          <button
            className="cursor-grab touch-none select-none text-muted-foreground hover:text-foreground p-1 rounded hover:bg-accent"
            data-drag-handle=""
            {...attributes}
            {...listeners}
            aria-label="Drag to reorder folder"
          >
            <GripVertical className="size-4" />
          </button>

          <button
            onClick={onToggleCollapsed}
            className="text-muted-foreground hover:text-foreground p-0.5 rounded hover:bg-accent"
            aria-label={collapsed ? "Expand folder" : "Collapse folder"}
          >
            {collapsed ? (
              <ChevronRight className="size-4" />
            ) : (
              <ChevronDown className="size-4" />
            )}
          </button>

          {isEditingName && !folder.IsDefault ? (
            <div
              className="flex-1 min-w-0"
              onClick={(e) => e.stopPropagation()}
              onKeyDown={(e) => e.stopPropagation()}
            >
              <EditableHeader
                ref={nameRef}
                value={folder.Name}
                setValue={handleSaveName}
                onBlur={() => setIsEditingName(false)}
                placeholder="Untitled Folder"
                className="text-sm font-medium p-0.5 min-h-0"
              />
            </div>
          ) : (
            <button
              className={cn(
                "flex-1 min-w-0 text-left text-sm font-medium truncate px-0.5 py-0.5 rounded",
                !folder.IsDefault &&
                  "hover:bg-accent cursor-text hover:underline",
                folder.IsDefault && "cursor-default",
              )}
              onClick={() => {
                if (!folder.IsDefault)
                  setTimeout(() => setIsEditingName(true), 0);
              }}
            >
              {folderName(folder)}
              <span className="text-muted-foreground font-normal ml-1.5">
                ({projects.length})
              </span>
            </button>
          )}

          <div className="flex items-center gap-0.5 shrink-0">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-7"
                  aria-label="Folder options"
                >
                  <MoreHorizontal className="size-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  disabled={visibleFolderIds.length === 0}
                  onClick={() => collapseFolders(visibleFolderIds)}
                >
                  <ChevronsDownUp />
                  Collapse all
                </DropdownMenuItem>
                <DropdownMenuItem
                  disabled={visibleFolderIds.length === 0}
                  onClick={() => expandFolders(visibleFolderIds)}
                >
                  <ChevronsUpDown />
                  Expand all
                </DropdownMenuItem>
                {!archivedView && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      disabled={emptyFolderIds.length === 0}
                      onClick={() => collapseFolders(emptyFolderIds)}
                    >
                      <ChevronsDownUp />
                      Collapse empty
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      disabled={nonEmptyFolderIds.length === 0}
                      onClick={() => expandFolders(nonEmptyFolderIds)}
                    >
                      <ChevronsUpDown />
                      Expand non-empty
                    </DropdownMenuItem>
                  </>
                )}
                {!folder.IsDefault && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      variant="destructive"
                      onClick={() => setDeleteOpen(true)}
                    >
                      <Trash2Icon />
                      Delete
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Card grid */}
        <AnimatePresence initial={false}>
          {!collapsed && (
            <motion.div
              key="grid"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2, ease: "easeInOut" }}
              className="overflow-hidden"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 p-1 sm:pl-7">
                {projects.length === 0 ? (
                  <div className="col-span-full flex items-center justify-center rounded-lg border border-dashed py-6 text-sm text-muted-foreground">
                    No projects in this folder.
                  </div>
                ) : (
                  projects.map((project) => (
                    <React.Fragment key={project.ID}>
                      {renderProjectCard(project)}
                    </React.Fragment>
                  ))
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <DeleteProjectFolderDialog
        folder={folder}
        allFolders={allFolders}
        projectCount={projects.length}
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
      />
    </>
  );
}
