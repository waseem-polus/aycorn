import { toast } from "sonner";
import { EditableHeader } from "@/components/EditableHeader";
import { useSavedFilterMutations } from "@/features/saved-filters/queries/useSavedFilterMutations";
import type { SavedFilter } from "@/features/saved-filters/saved-filter-types";

/** Rename in place; an emptied name falls back to "Untitled filter" on the server. */
export function FilterNameCell({ filter }: { filter: SavedFilter }) {
  const { update } = useSavedFilterMutations();
  return (
    <div
      className="flex min-w-0 flex-1 items-center"
      onClick={(e) => e.stopPropagation()}
      onKeyDown={(e) => e.stopPropagation()}
    >
      <EditableHeader
        value={filter.Name}
        placeholder="Untitled filter"
        className="w-full min-w-0 cursor-text p-1 -m-1 text-sm font-normal"
        setValue={(name) => {
          if (name === filter.Name) return;
          update.mutate(
            { id: filter.ID, patch: { name } },
            { onError: () => toast.error("Couldn't rename the filter.") },
          );
        }}
      />
    </div>
  );
}
