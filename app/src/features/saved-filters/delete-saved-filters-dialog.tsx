import { toast } from "sonner";
import { bulkResultToast } from "@/features/workflows/shared/bulk-result-toast";
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
import { useSavedFilterMutations } from "@/features/saved-filters/queries/useSavedFilterMutations";
import type { SavedFilter } from "@/features/saved-filters/saved-filter-types";

type Props = {
  filters: SavedFilter[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDeleted?: () => void;
};

/** Confirms deleting one or more filters — they disappear from every board they're pinned to. */
export function DeleteSavedFiltersDialog({ filters, open, onOpenChange, onDeleted }: Props) {
  const { bulkDelete } = useSavedFilterMutations();
  const pinCount = filters.reduce((n, f) => n + f.Pins.length, 0);
  const title =
    filters.length === 1 ? `Delete “${filters[0].Name}”?` : `Delete ${filters.length} filters?`;

  const confirm = () => {
    bulkDelete.mutate(
      filters.map((f) => f.ID),
      {
        onSuccess: (result) => {
          bulkResultToast(result, `Deleted ${result.success} filter${result.success === 1 ? "" : "s"}.`);
          onDeleted?.();
        },
        onError: () => toast.error("Couldn't delete. Try again."),
      },
    );
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>
            {pinCount > 0
              ? `${filters.length === 1 ? "It's" : "They're"} pinned to ${pinCount} board${pinCount === 1 ? "" : "s"} and will be removed from all of them. `
              : ""}
            This can't be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction variant="destructive" onClick={confirm}>
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
