import { format, formatDistanceToNow } from "date-fns";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export function RelativeTimeWithTooltip({
  date,
  label,
}: {
  date: string;
  label: string;
}) {
  if (!date) return null;

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span className="text-sm text-muted-foreground">
          {label} {formatDistanceToNow(new Date(date), { addSuffix: true })}
        </span>
      </TooltipTrigger>
      <TooltipContent>
        {format(new Date(date), "MMM d, yyyy (h:mm a)")}
      </TooltipContent>
    </Tooltip>
  );
}
