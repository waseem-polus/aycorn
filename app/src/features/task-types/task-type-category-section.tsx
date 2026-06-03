import React, { useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  ChevronDown,
  ChevronRight,
  GripVertical,
  MoreHorizontal,
  Plus,
  Trash2Icon,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { EditableHeader } from "@/components/EditableHeader";
import { useFocusAndSelect } from "@/hooks/useFocusAndSelect";
import { DeleteTaskTypeCategoryDialog } from "@/features/task-types/delete-task-type-category-dialog";
import { useTaskTypeCategoryMutation } from "@/features/task-types/queries/useTaskTypeCategoryMutation";
import { useTaskTypeMutation } from "@/features/task-types/queries/useTaskTypeMutation";
import { cn } from "@/lib/utils";
import type { TaskTypeCategory, TaskTypeGlobal } from "@/types/types";

const COLLAPSED_STORAGE_KEY = (id: number) => `taskType_cat_collapsed_${id}`;

function readCollapsed(id: number): boolean {
  try {
    return localStorage.getItem(COLLAPSED_STORAGE_KEY(id)) === "true";
  } catch {
    return false;
  }
}

function writeCollapsed(id: number, collapsed: boolean) {
  try {
    if (collapsed) {
      localStorage.setItem(COLLAPSED_STORAGE_KEY(id), "true");
    } else {
      localStorage.removeItem(COLLAPSED_STORAGE_KEY(id));
    }
  } catch {
    // ignore
  }
}

type Props = {
  category: TaskTypeCategory;
  allCategories: TaskTypeCategory[];
  types: TaskTypeGlobal[];
  isDropTarget: boolean;
  renderTypeCard: (type: TaskTypeGlobal) => React.ReactNode;
};

export function TaskTypeCategorySection({
  category,
  allCategories,
  types,
  isDropTarget,
  renderTypeCard,
}: Props) {
  const [collapsed, setCollapsed] = useState(() => readCollapsed(category.ID));
  const [isEditingName, setIsEditingName] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const nameRef = useRef<HTMLHeadingElement>(null);

  const { updateCategory } = useTaskTypeCategoryMutation();
  const { createTaskType } = useTaskTypeMutation();

  useFocusAndSelect(nameRef, isEditingName);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: `cat-${category.ID}`,
    data: { type: "category", categoryId: category.ID },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const toggleCollapsed = () => {
    const next = !collapsed;
    setCollapsed(next);
    writeCollapsed(category.ID, next);
  };

  const handleSaveName = (newName: string) => {
    setIsEditingName(false);
    if (newName !== category.Name) {
      updateCategory.mutate(
        { id: category.ID, name: newName },
        { onError: () => toast.error("Failed to rename category.") },
      );
    }
  };

  const handleCreateType = () => {
    createTaskType.mutate(
      { Category: category.ID },
      { onError: () => toast.error("Failed to create type.") },
    );
    if (collapsed) {
      setCollapsed(false);
      writeCollapsed(category.ID, false);
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
            aria-label="Drag to reorder category"
          >
            <GripVertical className="size-4" />
          </button>

          <button
            onClick={toggleCollapsed}
            className="text-muted-foreground hover:text-foreground p-0.5 rounded hover:bg-accent"
            aria-label={collapsed ? "Expand category" : "Collapse category"}
          >
            {collapsed ? (
              <ChevronRight className="size-4" />
            ) : (
              <ChevronDown className="size-4" />
            )}
          </button>

          {isEditingName && !category.IsDefault ? (
            <div
              className="flex-1 min-w-0"
              onClick={(e) => e.stopPropagation()}
              onKeyDown={(e) => e.stopPropagation()}
            >
              <EditableHeader
                ref={nameRef}
                value={category.Name}
                setValue={handleSaveName}
                onBlur={() => setIsEditingName(false)}
                placeholder="Untitled Category"
                className="text-sm font-medium p-0.5 min-h-0"
              />
            </div>
          ) : (
            <button
              className={cn(
                "flex-1 min-w-0 text-left text-sm font-medium truncate px-0.5 py-0.5 rounded",
                !category.IsDefault &&
                  "hover:bg-accent cursor-text hover:underline",
                category.IsDefault && "cursor-default",
              )}
              onClick={() => {
                if (!category.IsDefault)
                  setTimeout(() => setIsEditingName(true), 0);
              }}
            >
              {category.Name !== "" ? category.Name : "Untitled Category"}
              <span className="text-muted-foreground font-normal ml-1.5">
                ({types.length})
              </span>
            </button>
          )}

          <div className="flex items-center gap-0.5 shrink-0">
            <Button
              variant="ghost"
              size="icon"
              className="size-7"
              onClick={handleCreateType}
              disabled={createTaskType.isPending}
              aria-label="Add type to category"
            >
              <Plus className="size-4" />
            </Button>

            {!category.IsDefault && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-7"
                    aria-label="Category options"
                  >
                    <MoreHorizontal className="size-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem
                    variant="destructive"
                    onClick={() => setDeleteOpen(true)}
                  >
                    <Trash2Icon />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
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
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 p-1 sm:pl-7 ">
                {types.length === 0 ? (
                  <div className="col-span-full flex items-center justify-center rounded-lg border border-dashed py-6 text-sm text-muted-foreground">
                    No types in this category.
                  </div>
                ) : (
                  types.map((type) => (
                    <React.Fragment key={type.ID}>
                      {renderTypeCard(type)}
                    </React.Fragment>
                  ))
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <DeleteTaskTypeCategoryDialog
        category={category}
        allCategories={allCategories}
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
      />
    </>
  );
}
