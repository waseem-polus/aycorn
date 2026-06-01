import { useEffect, useState } from "react";
import { CalendarIcon, ClockIcon, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import { Switch } from "@/components/ui/switch";
import { useDateFormat } from "@/hooks/useDateFormatter";
import type { DateRange } from "react-day-picker";
import { isSameDay } from "date-fns";

type Props = {
  from?: string | null;
  to?: string | null;
  hasFromTime?: boolean;
  hasToTime?: boolean;
  mode?: "date" | "datetime";
  placeholder?: string;
  onRangeChange: (
    from: string | null,
    to: string | null,
    hasFromTime?: boolean,
    hasToTime?: boolean,
  ) => void;
};

const parseLocalDate = (s: string): Date => {
  if (s.includes("T")) return new Date(s);
  const [y, m, d] = s.split("-").map(Number);
  return new Date(y, m - 1, d);
};

const toYMD = (d: Date): string => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
};

const getTimeFromISO = (iso: string | null): string => {
  if (!iso || !iso.includes("T")) return "";
  return new Date(iso).toTimeString().slice(0, 5);
};

const setTimeOnDate = (isoDate: string | null, time: string): string | null => {
  if (!isoDate || !time) return isoDate;
  const d = parseLocalDate(isoDate);
  const [hours, minutes] = time.split(":").map(Number);
  d.setHours(hours, minutes);
  return d.toISOString();
};

const clearTimeFromISO = (iso: string | null): string | null => {
  if (!iso) return iso;
  const d = new Date(iso);
  d.setHours(0, 0, 0, 0);
  return d.toISOString();
};

export function DateRangePicker({
  from,
  to,
  hasFromTime = false,
  hasToTime = false,
  mode = "date",
  placeholder = "Select a date range",
  onRangeChange,
}: Props) {
  const [open, setOpen] = useState(false);
  const { toFormatted, toFormattedTime } = useDateFormat();

  const fromDate = from ? parseLocalDate(from) : undefined;
  const toDate = to ? parseLocalDate(to) : undefined;

  const [localRange, setLocalRange] = useState<DateRange | undefined>(
    fromDate || toDate ? { from: fromDate, to: toDate } : undefined,
  );

  useEffect(() => {
    const newFrom = from ? parseLocalDate(from) : undefined;
    const newTo = to ? parseLocalDate(to) : undefined;
    setLocalRange(newFrom || newTo ? { from: newFrom, to: newTo } : undefined);
  }, [from, to]);

  const emit = (
    newFrom: string | null,
    newTo: string | null,
    newHasFromTime = hasFromTime,
    newHasToTime = hasToTime,
  ) => {
    onRangeChange(newFrom, newTo, newHasFromTime, newHasToTime);
  };

  const handleSelect = (selected: DateRange | undefined) => {
    setLocalRange(selected);

    if (mode === "date") {
      const newFrom = selected?.from ? toYMD(selected.from) : null;
      const newTo = selected?.to ? toYMD(selected.to) : null;
      emit(newFrom, newTo);
      return;
    }

    // datetime mode: preserve existing times when switching dates
    const existingTimeFrom = getTimeFromISO(from ?? null);
    const existingTimeTo = getTimeFromISO(to ?? null);

    const newFrom = selected?.from
      ? setTimeOnDate(selected.from.toISOString(), existingTimeFrom)
      : null;
    const newTo = selected?.to
      ? setTimeOnDate(selected.to.toISOString(), existingTimeTo)
      : null;

    const newHasToTime = selected?.to ? hasToTime : false;
    emit(newFrom, newTo, hasFromTime, newHasToTime);
  };

  const handleTimeChange = (type: "from" | "to", time: string) => {
    const newFrom =
      type === "from" ? setTimeOnDate(from ?? null, time) : (from ?? null);
    const newTo =
      type === "to" ? setTimeOnDate(to ?? null, time) : (to ?? null);
    emit(newFrom, newTo);
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    setLocalRange(undefined);
    emit(null, null, false, false);
  };

  const label = (() => {
    if (!localRange?.from) return null;
    const hasDifferentEnd =
      localRange.to && !isSameDay(localRange.from, localRange.to);

    const fromLabel =
      mode === "datetime" && hasFromTime && from
        ? `${toFormatted(localRange.from)} ${toFormattedTime(from)}`
        : toFormatted(localRange.from);

    const toLabel = hasDifferentEnd
      ? mode === "datetime" && hasToTime && to
        ? `${toFormatted(localRange.to!)} ${toFormattedTime(to!)}`
        : toFormatted(localRange.to!)
      : null;

    return (
      <span className="font-normal text-foreground">
        {fromLabel}
        {toLabel && ` → ${toLabel}`}
      </span>
    );
  })();

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" className="w-full justify-start font-normal">
          <CalendarIcon className="size-4 shrink-0 text-muted-foreground" />
          {label ?? (
            <span className="text-muted-foreground">{placeholder}</span>
          )}
          {(localRange?.from || localRange?.to) && (
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
      <PopoverContent
        className="flex flex-col w-auto overflow-hidden p-2 gap-3"
        align="start"
        data-vaul-no-drag
      >
        <Calendar
          mode="range"
          className="p-0"
          selected={localRange}
          captionLayout="dropdown"
          onSelect={handleSelect}
        />

        {mode === "datetime" && (
          <>
            <InputGroup>
              <InputGroupAddon>
                <ClockIcon />
              </InputGroupAddon>
              <InputGroupInput
                className="w-full"
                type="time"
                disabled={!hasFromTime}
                value={hasFromTime ? getTimeFromISO(from ?? null) : ""}
                onChange={(e) => handleTimeChange("from", e.target.value)}
              />
              <div className="flex items-center pr-2">
                <Switch
                  checked={hasFromTime}
                  onCheckedChange={(checked) => {
                    const newFrom = checked
                      ? (from ?? null)
                      : clearTimeFromISO(from ?? null);
                    emit(newFrom, to ?? null, checked, hasToTime);
                  }}
                  className="hover:cursor-pointer"
                />
              </div>
            </InputGroup>

            {hasFromTime && (
              <InputGroup>
                <InputGroupAddon>
                  <ClockIcon />
                </InputGroupAddon>
                <InputGroupInput
                  className="w-full"
                  type="time"
                  disabled={!hasToTime || !localRange?.to}
                  value={hasToTime ? getTimeFromISO(to ?? null) : ""}
                  onChange={(e) => handleTimeChange("to", e.target.value)}
                />
                <div className="flex items-center pr-2">
                  <Switch
                    checked={hasToTime}
                    disabled={!localRange?.to}
                    onCheckedChange={(checked) => {
                      const newTo = checked
                        ? (to ?? null)
                        : clearTimeFromISO(to ?? null);
                      emit(from ?? null, newTo, hasFromTime, checked);
                    }}
                    className="hover:cursor-pointer"
                  />
                </div>
              </InputGroup>
            )}
          </>
        )}
      </PopoverContent>
    </Popover>
  );
}
