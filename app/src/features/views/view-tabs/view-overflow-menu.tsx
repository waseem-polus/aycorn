import { ChevronDownIcon, PlusIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
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
  /** The views that don't fit the tab strip. */
  views: BoardView[];
  onSelect: (id: number) => void;
  onAdd: () => void;
};

/** The `+N` menu at the end of the tab strip: hidden views, and New view. */
export function ViewOverflowMenu({ views, onSelect, onAdd }: Props) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="h-8 shrink-0 gap-1 px-2 text-muted-foreground"
          aria-label={`${views.length} more views`}
        >
          +{views.length}
          <ChevronDownIcon />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="min-w-48 max-w-72">
        {views.map((view) => (
          <DropdownMenuItem key={view.ID} onSelect={() => onSelect(view.ID)}>
            <ViewIcon view={view} />
            <Tooltip>
              <TooltipTrigger asChild>
                <span className="truncate">{view.Name}</span>
              </TooltipTrigger>
              {view.Name && <TooltipContent side="right">{view.Name}</TooltipContent>}
            </Tooltip>
          </DropdownMenuItem>
        ))}
        <DropdownMenuSeparator />
        <DropdownMenuItem onSelect={onAdd}>
          <PlusIcon />
          New view
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
