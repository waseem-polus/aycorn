import { Badge } from "@/components/ui/badge";
import { useDateFormat } from "@/hooks/useDateFormatter";
import { cn } from "@/lib/utils";
import { CalendarIcon } from "lucide-react";

type Props = {
  start: string | null;
  end: string | null;
  hasStartTime: boolean;
  hasEndTime: boolean;
  excludeYear?: boolean;
  className?: string;
};

export function TaskPlannedDates({
  start,
  end,
  hasStartTime,
  hasEndTime,
  excludeYear = false,
  className = "",
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

  const isSameDay =
    end !== null &&
    new Date(start).toDateString() === new Date(end).toDateString();

  const label =
    end !== null && !isSameDay
      ? `${formatDateTime(start, hasStartTime)} → ${formatDateTime(end, hasEndTime)}`
      : formatDateTime(start, hasStartTime);

  return (
    <Badge variant="secondary" className={className}>
      <CalendarIcon className="size-2" />
      {label}
    </Badge>
  );
}
