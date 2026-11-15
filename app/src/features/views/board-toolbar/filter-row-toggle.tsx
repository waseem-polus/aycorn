import { FilterIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

type Props = {
  shown: boolean;
  onToggle: () => void;
  /** Filters narrowing the list; surfaced as a badge while the row is hidden. */
  activeCount: number;
};

/** Shows or hides the sort and filter row. A badge keeps hidden filters from going unnoticed. */
export function FilterRowToggle({ shown, onToggle, activeCount }: Props) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className="relative aria-pressed:bg-accent"
          aria-label={shown ? "Hide filters" : "Show filters"}
          aria-pressed={shown}
          onClick={onToggle}
        >
          <FilterIcon />
          {!shown && activeCount > 0 && (
            <Badge className="absolute -top-1.5 -right-1.5 h-4 min-w-4 justify-center px-1 text-[10px]">
              {activeCount}
            </Badge>
          )}
        </Button>
      </TooltipTrigger>
      <TooltipContent>{shown ? "Hide filters" : "Show filters"}</TooltipContent>
    </Tooltip>
  );
}
