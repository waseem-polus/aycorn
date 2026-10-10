import { Badge } from "@/components/ui/badge";
import { STAGE_PALETTE } from "@/features/stage/stage-palette";
import { useDateFormat } from "@/hooks/useDateFormatter";
import { isSameDay } from "date-fns";
import { cn } from "@/lib/utils";
import { CalendarIcon } from "lucide-react";

type Props = {
  start: string | null;
  end: string | null;
  hasStartTime: boolean;
  hasEndTime: boolean;
  excludeYear?: boolean;
  className?: string;
  overdue?: boolean;
};

export function TaskPlannedDates({
  start,
  end,
  hasStartTime,
  hasEndTime,
  excludeYear = false,
  className = "",
  overdue = false,
}: Props) {
  const { toFormatted, toFormattedTime } = useDateFormat(excludeYear);

  if (start === null) {
    return (
      <Badge
        variant="outline"
        className={cn("text-muted-foreground", className)}
      >
        <CalendarIcon className="size-2" />
        Not Scheduled
      </Badge>
    );
  }

  const formatDateTime = (dateStr: string, showTime: boolean) => {
    if (!showTime) return toFormatted(dateStr);
    return `${toFormatted(dateStr)} ${toFormattedTime(dateStr)}`;
  };

  const sameDay =
    end !== null && isSameDay(new Date(start), new Date(end));

  const label =
    end !== null && !sameDay
      ? `${formatDateTime(start, hasStartTime)} → ${formatDateTime(end, hasEndTime)}`
      : formatDateTime(start, hasStartTime);

  return (
    <Badge
      variant="secondary"
      className={cn(overdue ? STAGE_PALETTE.rose.badge : "", className)}
    >
      <CalendarIcon
        className={cn(overdue ? STAGE_PALETTE.rose.stroke : "", "size-2")}
      />
      {label}
    </Badge>
  );
}
