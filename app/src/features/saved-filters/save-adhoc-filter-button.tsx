import { useState } from "react";
import { SavePlusIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SaveFilterPopover } from "@/features/saved-filters/save-filter-popover";

type Props = {
  /** Saves the drawer's filters as a quick filter named `name`. */
  onSave: (name: string) => Promise<void> | void;
};

/** The filter drawer's footer action: keep these ad-hoc filters as a quick filter. */
export function SaveAdhocFilterButton({ onSave }: Props) {
  const [open, setOpen] = useState(false);
  return (
    <SaveFilterPopover
      open={open}
      onOpenChange={setOpen}
      onSave={onSave}
      align="start"
      trigger={
        <Button className="w-full">
          <SavePlusIcon />
          Save as quick filter
        </Button>
      }
    />
  );
}
