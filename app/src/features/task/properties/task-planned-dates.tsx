import { Badge } from "@/components/ui/badge";
import { useDateFormat } from "@/hooks/useDateFormatter";
import { cn } from "@/lib/utils";
import { CalendarIcon } from "lucide-react";

type Props = {
  start: string | null;
  end: string | null;
  className?: string;
};

export function TaskPlannedDates({ start, end, className = "" }: Props) {
  const { toFormatted, toFormattedTime } = useDateFormat();

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

  const formatDateTime = (dateStr: string) => {
    const time = toFormattedTime(dateStr);
    return time ? `${toFormatted(dateStr)} ${time}` : toFormatted(dateStr);
  };

  const isSameDay =
    end !== null &&
    new Date(start).toDateString() === new Date(end).toDateString();

  const label =
    end !== null && !isSameDay
      ? `${formatDateTime(start)} → ${formatDateTime(end)}`
      : formatDateTime(start);

  return (
    <Badge variant="secondary" className={className}>
      <CalendarIcon className="size-2" />
      {label}
    </Badge>
  );
}
