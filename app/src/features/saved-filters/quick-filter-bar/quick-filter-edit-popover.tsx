import { PopoverContent } from "@/components/ui/popover";
import type { QuickFiltersAPI } from "@/features/saved-filters/hooks/useQuickFilters";
import type { SavedFilter } from "@/features/saved-filters/saved-filter-types";
import { UnsavedChangesAlert } from "@/features/saved-filters/unsaved-changes-alert";
import { ConditionBuilder } from "@/features/task-filters/conditions/condition-builder";
import type { ConditionOptionSources } from "@/features/task-filters/conditions/condition-builder-context";
import { useConditionTree } from "@/features/task-filters/conditions/hooks/useConditionTree";

type Props = {
  filter: SavedFilter;
  api: QuickFiltersAPI;
  sources: ConditionOptionSources;
  saveAsOpen: boolean;
  onSaveAsOpenChange: (open: boolean) => void;
  /** Closes the editor — after Save as new, the edits live on another chip. */
  onClose: () => void;
};

/**
 * A quick filter's editor, as the content of the chip's popover: its condition
 * tree (the name is edited inline on the chip), and — once the tree differs from
 * what's saved — Save / Save as new / Discard. Tree edits apply to the board
 * live, as a local draft.
 */
export function QuickFilterEditPopover({
  filter,
  api,
  sources,
  saveAsOpen,
  onSaveAsOpenChange,
  onClose,
}: Props) {
  const tree = useConditionTree(api.treeOf(filter), (fn) => api.updateTree(filter.ID, fn));
  const edited = api.isEdited(filter);

  return (
    <PopoverContent
      align="start"
      className="flex w-[36rem] max-w-[calc(100vw-2rem)] max-h-[70vh] flex-col gap-4 overflow-y-auto"
      // Clicking a toast (e.g. Undo after clearing conditions) isn't a
      // click away from the editor.
      onInteractOutside={(e) => {
        if ((e.target as Element | null)?.closest("[data-sonner-toaster]")) {
          e.preventDefault();
        }
      }}
      onOpenAutoFocus={(e) => e.preventDefault()}
    >
      <ConditionBuilder tree={tree} sources={sources} />

      {edited && (
        <UnsavedChangesAlert
          onSave={() => void api.save(filter.ID)}
          onSaveAsNew={async (newName) => {
            await api.saveAsNew(filter.ID, newName);
            onClose();
          }}
          onDiscard={() => api.discard(filter.ID)}
          defaultName={`${filter.Name} copy`}
          saveAsOpen={saveAsOpen}
          onSaveAsOpenChange={onSaveAsOpenChange}
        />
      )}
    </PopoverContent>
  );
}
