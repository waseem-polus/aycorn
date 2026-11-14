import { useRef } from "react";
import { CheckIcon, ChevronDownIcon, PlusIcon, Settings2Icon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { ViewIcon } from "@/features/views/view-icon";
import type { BoardView } from "@/features/views/view-types";

type Props = {
  views: BoardView[];
  selectedId: number | null;
  onSelect: (id: number) => void;
  onAdd: () => void;
  onOpenSettings: () => void;
};

/**
 * The view switcher on mobile: the current view as a dropdown of all views,
 * plus New view and View settings (there's no room for the tab strip or the
 * settings button).
 */
export function ViewSelectMobile({
  views,
  selectedId,
  onSelect,
  onAdd,
  onOpenSettings,
}: Props) {
  const selected = views.find((v) => v.ID === selectedId);
  // Settings and creation open a popover, which must wait for the menu to
  // finish closing — sooner, its teardown dismisses it (or steals focus).
  const pendingAction = useRef<"add" | "settings" | null>(null);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          className="max-w-56 justify-between gap-2"
          data-view-settings-toggle=""
        >
          {selected && <ViewIcon view={selected} />}
          <Tooltip>
            <TooltipTrigger asChild>
              <span className="truncate">{selected?.Name ?? "Views"}</span>
            </TooltipTrigger>
            {selected?.Name && <TooltipContent>{selected.Name}</TooltipContent>}
          </Tooltip>
          <ChevronDownIcon className="text-muted-foreground" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="start"
        className="min-w-56 max-w-[calc(100vw-2rem)]"
        onCloseAutoFocus={(e) => {
          const action = pendingAction.current;
          pendingAction.current = null;
          if (!action) return;
          e.preventDefault();
          if (action === "add") onAdd();
          else onOpenSettings();
        }}
      >
        <DropdownMenuLabel>Views</DropdownMenuLabel>
        {views.map((view) => (
          <DropdownMenuItem key={view.ID} onSelect={() => onSelect(view.ID)}>
            <ViewIcon view={view} />
            <span className="truncate">{view.Name}</span>
            {view.ID === selectedId && <CheckIcon className="ml-auto" />}
          </DropdownMenuItem>
        ))}
        <DropdownMenuSeparator />
        <DropdownMenuItem onSelect={() => (pendingAction.current = "add")}>
          <PlusIcon />
          New view
        </DropdownMenuItem>
        <DropdownMenuItem
          disabled={selected === undefined}
          onSelect={() => (pendingAction.current = "settings")}
        >
          <Settings2Icon />
          View settings
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
