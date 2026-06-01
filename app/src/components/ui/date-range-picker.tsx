import { useState } from "react";
import { CalendarIcon, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useDateFormat } from "@/hooks/useDateFormatter";
import type { DateRange } from "react-day-picker";
import { isSameDay } from "date-fns";

type Props = {
  from?: string | null;
  to?: string | null;
  placeholder?: string;
  onRangeChange: (from: string | null, to: string | null) => void;
};

const parseLocalDate = (s: string): Date => {
  const [y, m, d] = s.split("-").map(Number);
  return new Date(y, m - 1, d);
};

const toYMD = (d: Date): string => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
};

export function DateRangePicker({
  from,
  to,
  placeholder = "Select a date range",
  onRangeChange,
}: Props) {
  const [open, setOpen] = useState(false);
  const { toFormatted } = useDateFormat(true);

  const fromDate = from ? parseLocalDate(from) : undefined;
  const toDate = to ? parseLocalDate(to) : undefined;

  const range: DateRange | undefined =
    fromDate || toDate ? { from: fromDate, to: toDate } : undefined;

  const label = (() => {
    if (!fromDate) return null;
    const hasDifferentEnd = toDate && !isSameDay(fromDate, toDate);
    return (
      <span className="font-normal text-foreground">
        {toFormatted(fromDate)}
        {hasDifferentEnd && ` → ${toFormatted(toDate!)}`}
      </span>
    );
  })();

  const handleSelect = (selected: DateRange | undefined) => {
    const newFrom = selected?.from ? toYMD(selected.from) : null;
    const newTo = selected?.to ? toYMD(selected.to) : null;
    onRangeChange(newFrom, newTo);
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onRangeChange(null, null);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className="w-full justify-start font-normal"
        >
          <CalendarIcon className="size-4 shrink-0 text-muted-foreground" />
          {label ?? (
            <span className="text-muted-foreground">{placeholder}</span>
          )}
          {(from || to) && (
            <span
              role="button"
              aria-label="Clear date range"
              className="ml-auto rounded-full p-0.5 hover:bg-muted-foreground/20"
              onClick={handleClear}
            >
              <X className="size-3.5" />
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-2" align="start">
        <Calendar
          mode="range"
          className="p-0"
          selected={range}
          captionLayout="dropdown"
          onSelect={handleSelect}
        />
      </PopoverContent>
    </Popover>
  );
}
