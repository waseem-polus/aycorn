import { RelativeTimeWithTooltip } from "@/components/relative-time-with-tooltip";
import { Badge } from "@/components/ui/badge";
import { STAGE_PALETTE } from "@/features/stage/stage-palette";
import { cn } from "@/lib/utils";
import { CalendarIcon } from "lucide-react";

type Props = {
  start: string | null;
  end: string | null;
    overdue?: boolean;
  className?: string;
};

export default function RelativePlannedDateBadge({
  start,
  overdue = false,
  className = "",
}: Props) {
    if (start === null) {
      return (
        <Badge
          variant="outline"
          className={cn("text-muted-foreground", className)}
        >
          <CalendarIcon className="size-2" />
          —
        </Badge>
      );
    }

    return (
        <Badge
          variant="secondary"
          className={cn(overdue ? STAGE_PALETTE.rose.badge : "", className)}
        >
            <CalendarIcon className={cn(overdue ? STAGE_PALETTE.rose.stroke : "", "size-2")} />
            <RelativeTimeWithTooltip
                excludeTime
                date={start}
                className={cn("text-xs text-foreground", overdue ? STAGE_PALETTE.rose.calendarBadge : "")}
            />
        </Badge>
    );
}
