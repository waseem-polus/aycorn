import { useState } from "react";
import { PopoverContent } from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
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
  /** Focus and select the name first — a just-created filter. */
  focusName: boolean;
  saveAsOpen: boolean;
  onSaveAsOpenChange: (open: boolean) => void;
  /** Closes the editor — after Save as new, the edits live on another chip. */
  onClose: () => void;
};

/**
 * A quick filter's editor, as the content of the chip's popover: its name
 * (renamed on blur), its condition tree, and — once the tree differs from
 * what's saved — Save / Save as new / Discard. Tree edits apply to the board
 * live, as a local draft.
 */
export function QuickFilterEditPopover({
  filter,
  api,
  sources,
  focusName,
  saveAsOpen,
  onSaveAsOpenChange,
  onClose,
}: Props) {
  const tree = useConditionTree(api.treeOf(filter), (fn) => api.updateTree(filter.ID, fn));
  const [name, setName] = useState(filter.Name);
  const edited = api.isEdited(filter);

  const commitName = () => {
    const trimmed = name.trim();
    if (!trimmed) return setName(filter.Name);
    if (trimmed !== filter.Name) void api.rename(filter.ID, trimmed);
  };

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
      onOpenAutoFocus={(e) => {
        if (!focusName) e.preventDefault();
      }}
    >
      <div className="flex items-center gap-2">
        <Input
          autoFocus={focusName}
          onFocus={(e) => focusName && e.currentTarget.select()}
          value={name}
          aria-label="Filter name"
          className="h-8 border-transparent px-1.5 text-base font-medium shadow-none hover:border-input focus-visible:border-input"
          onChange={(e) => setName(e.target.value)}
          onBlur={commitName}
          onKeyDown={(e) => {
            if (e.key === "Enter") e.currentTarget.blur();
            if (e.key === "Escape") setName(filter.Name);
          }}
        />
        {edited && (
          <span
            className="size-1.5 shrink-0 rounded-full bg-primary"
            role="img"
            aria-label="Unsaved changes"
          />
        )}
      </div>

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
