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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useTaskTypeCategoryMutation } from "@/features/task-types/queries/useTaskTypeCategoryMutation";
import type { TaskTypeCategory } from "@/types/types";
import { toast } from "sonner";

type Props = {
  category: TaskTypeCategory;
  allCategories: TaskTypeCategory[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function DeleteTaskTypeCategoryDialog({
  category,
  allCategories,
  open,
  onOpenChange,
}: Props) {
  const [transferId, setTransferId] = useState<string>("");
  const { deleteCategory } = useTaskTypeCategoryMutation();

  const candidates = allCategories.filter((c) => c.ID !== category.ID);
  const displayName = category.Name !== "" ? category.Name : "Untitled Category";

  const handleOpenChange = (next: boolean) => {
    if (!next) setTransferId("");
    onOpenChange(next);
  };

  return (
    <AlertDialog open={open} onOpenChange={handleOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete "{displayName}"?</AlertDialogTitle>
          <AlertDialogDescription>
            Task types in this category will be moved to the selected category.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <Select value={transferId} onValueChange={setTransferId}>
          <SelectTrigger>
            <SelectValue placeholder="Move task types to..." />
          </SelectTrigger>
          <SelectContent>
            {candidates.map((c) => (
              <SelectItem key={c.ID} value={String(c.ID)}>
                {c.Name !== "" ? c.Name : "Untitled Category"}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            variant="destructive"
            disabled={transferId === "" || deleteCategory.isPending}
            onClick={() =>
              deleteCategory.mutate(
                { id: category.ID, transferCategoryId: Number(transferId) },
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
