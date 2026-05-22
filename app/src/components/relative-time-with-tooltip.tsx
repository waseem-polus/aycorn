import { format, formatDistanceToNow } from "date-fns";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

export function RelativeTimeWithTooltip({
  className = "",
  date,
  label,
}: {
  className?: string;
  date: string;
  label: string;
}) {
  if (!date) return null;

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span className={cn("text-sm text-muted-foreground", className)}>
          {label} {formatDistanceToNow(new Date(date), { addSuffix: true })}
        </span>
      </TooltipTrigger>
      <TooltipContent>
        {format(new Date(date), "MMM d, yyyy (h:mm a)")}
      </TooltipContent>
    </Tooltip>
  );
}
