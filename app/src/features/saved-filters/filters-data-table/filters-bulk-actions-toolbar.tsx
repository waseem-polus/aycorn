import { toast } from "sonner";
import { BulkActionsToolbarBase } from "@/components/bulk-actions-toolbar-base";
import { useSavedFilterMutations } from "@/features/saved-filters/queries/useSavedFilterMutations";
import type { SavedFilter } from "@/features/saved-filters/saved-filter-types";
import { bulkResultToast } from "@/features/workflows/shared/bulk-result-toast";

type Props = {
  selected: SavedFilter[];
  onClear: () => void;
};

export function FiltersBulkActionsToolbar({ selected, onClear }: Props) {
  const { bulkDelete } = useSavedFilterMutations();
  const pinCount = selected.reduce((n, f) => n + f.Pins.length, 0);

  return (
    <BulkActionsToolbarBase
      count={selected.length}
      onClear={onClear}
      delete={{
        title: `Delete ${selected.length} filter${selected.length === 1 ? "" : "s"}?`,
        description:
          (pinCount > 0
            ? `They're pinned to ${pinCount} board${pinCount === 1 ? "" : "s"} and will be removed from all of them. `
            : "") + "This can't be undone.",
        busy: bulkDelete.isPending,
        onConfirm: () =>
          bulkDelete.mutate(
            selected.map((f) => f.ID),
            {
              onSuccess: (result) => {
                bulkResultToast(result, `Deleted ${result.success} filter${result.success === 1 ? "" : "s"}.`);
                onClear();
              },
              onError: () => toast.error("Couldn't delete. Try again."),
            },
          ),
      }}
    />
  );
}
