import { useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useTaskTypeCategoryMutation } from "@/features/task-types/queries/useTaskTypeCategoryMutation";
import { cn } from "@/lib/utils";
import type { TaskTypeCategory } from "@/types/types";
import { toast } from "sonner";

type Props = {
  category: TaskTypeCategory;
  allCategories: TaskTypeCategory[];
  typeCount: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function DeleteTaskTypeCategoryDialog({
  category,
  allCategories,
  typeCount,
  open,
  onOpenChange,
}: Props) {
  const [transferId, setTransferId] = useState<number | null>(null);
  const { deleteCategory } = useTaskTypeCategoryMutation();

  const candidates = allCategories.filter((c) => c.ID !== category.ID);
  const displayName = category.Name !== "" ? category.Name : "Untitled Category";
  const hasTypes = typeCount > 0;

  const handleOpenChange = (next: boolean) => {
    if (!next) setTransferId(null);
    onOpenChange(next);
  };

  return (
    <AlertDialog open={open} onOpenChange={handleOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete "{displayName}"?</AlertDialogTitle>
          <AlertDialogDescription>
            {hasTypes
              ? "This category has task types. Choose a category to move them to before deleting."
              : "This category is empty and will be permanently deleted."}
          </AlertDialogDescription>
        </AlertDialogHeader>

        {hasTypes && (
          <div className="flex flex-col gap-2 overflow-y-auto max-h-60">
            {candidates.map((c) => {
              const selected = transferId === c.ID;
              const name = c.Name !== "" ? c.Name : "Untitled Category";
              return (
                <button
                  key={c.ID}
                  type="button"
                  onClick={() => setTransferId(c.ID)}
                  className={cn(
                    "flex items-center gap-3 rounded-lg border px-4 py-3 text-left transition-colors",
                    selected
                      ? "border-primary bg-primary/5"
                      : "border-border hover:bg-muted/50",
                  )}
                >
                  <span className="flex-1 min-w-0 text-sm font-medium truncate">
                    {name}
                  </span>
                  <span
                    className={cn(
                      "size-4 shrink-0 rounded-full border-2 transition-colors",
                      selected
                        ? "border-primary bg-primary"
                        : "border-muted-foreground",
                    )}
                  />
                </button>
              );
            })}
          </div>
        )}

        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            variant="destructive"
            disabled={(hasTypes && transferId === null) || deleteCategory.isPending}
            onClick={() =>
              deleteCategory.mutate(
                {
                  id: category.ID,
                  transferCategoryId: transferId ?? undefined,
                },
                {
                  onSuccess: () => toast(`Deleted "${displayName}".`),
                  onError: (err) =>
                    toast.error(err.message || "Failed to delete category."),
                },
              )
            }
          >
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
