import { Settings2Icon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useViewSettings } from "@/features/views/view-settings-context";

/** Toggles the selected view's settings popover (anchored to its tab). */
export function ViewSettingsButton({ selectedId }: { selectedId: number | null }) {
  const { editingId, setEditingId } = useViewSettings();

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          aria-label="View settings"
          data-view-settings-toggle=""
          disabled={selectedId === null}
          onClick={() => {
            if (selectedId === null) return;
            setEditingId(editingId === null ? selectedId : null);
          }}
        >
          <Settings2Icon />
        </Button>
      </TooltipTrigger>
      <TooltipContent>View settings</TooltipContent>
    </Tooltip>
  );
}
