import {
  differenceInCalendarDays,
  formatDistanceToNow,
  intlFormatDistance,
  startOfDay,
} from "date-fns";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { useDateFormat } from "@/hooks/useDateFormatter";

const formatDayOnly = (date: Date) => {
  if (differenceInCalendarDays(date, new Date()) === 0) return "today";
  return intlFormatDistance(startOfDay(date), startOfDay(new Date()), {
    numeric: "auto",
  });
};

export function RelativeTimeWithTooltip({
  className = "",
  date,
  excludeTime = false,
  label,
}: {
  className?: string;
  date: string;
  excludeTime?: boolean;
  label?: string;
}) {
    const { toFormatted, toFormattedTime } = useDateFormat(false);

    if (!date) return null;

    const parsedDate = new Date(date);
    const relativeLabel = excludeTime
        ? formatDayOnly(parsedDate)
        : formatDistanceToNow(parsedDate, { addSuffix: true });

    return (
        <Tooltip>
            <TooltipTrigger asChild>
                <span className={cn("text-sm text-muted-foreground", className)}>
                    {label? `${label} ${relativeLabel}` : relativeLabel.charAt(0).toUpperCase() + relativeLabel.slice(1)}
                </span>
            </TooltipTrigger>
            <TooltipContent>
                {excludeTime? toFormatted(date) : `${toFormatted(date)} ${toFormattedTime(date)}`}
            </TooltipContent>
        </Tooltip>
    );
}
