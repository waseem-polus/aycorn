import { SaveIcon, SavePlusIcon, Undo2Icon } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { SaveFilterPopover } from "@/features/saved-filters/save-filter-popover";

type Props = {
  onSave: () => void;
  onSaveAsNew: (name: string) => Promise<void> | void;
  onDiscard: () => void;
  /** Prefills the Save as new name. */
  defaultName: string;
  /** The Save as new name form, controlled so a menu item can open it. */
  saveAsOpen: boolean;
  onSaveAsOpenChange: (open: boolean) => void;
};

/**
 * Commit controls for a quick filter with local edits: Save / Save as new /
 * Discard. Shared filters are committed explicitly (not auto-saved) so tweaks
 * on one board don't silently change every board using them.
 */
export function UnsavedChangesAlert({
  onSave,
  onSaveAsNew,
  onDiscard,
  defaultName,
  saveAsOpen,
  onSaveAsOpenChange,
}: Props) {
  return (
    <Alert>
      <AlertTitle>Unsaved changes</AlertTitle>
      <AlertDescription>
        This filter has edits that aren't saved yet
      </AlertDescription>
      <div className="flex flex-wrap gap-2 mt-2">
        <Button size="sm" onClick={onSave}>
          <SaveIcon />
          Save
        </Button>
        <SaveFilterPopover
          open={saveAsOpen}
          onOpenChange={onSaveAsOpenChange}
          onSave={onSaveAsNew}
          align="start"
          defaultName={defaultName}
          trigger={
            <Button variant="outline" size="sm">
              <SavePlusIcon />
              Save as new
            </Button>
          }
        />
        <Button size="sm" variant="outline" className="ml-auto" onClick={onDiscard}>
          <Undo2Icon />
          Discard
        </Button>
      </div>
    </Alert>
  );
}
