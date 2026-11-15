import { ListFilterIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

type Props = {
  shown: boolean;
  onToggle: () => void;
  /** Filters narrowing the list, shown as a badge whether or not the row is open. */
  activeCount: number;
};

/** Shows or hides the sort and filter row. The badge counts active filters even while the row is open. */
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
          <ListFilterIcon />
          {activeCount > 0 && (
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
