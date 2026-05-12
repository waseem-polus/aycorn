import { useContext, useState } from "react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { type DateRange } from "react-day-picker";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CalendarIcon, ClockCheckIcon, ClockIcon } from "lucide-react";
import { TaskContext } from "@/contexts/task/TaskContext";
import type { Task } from "@/types/types";
import { useDateFormat } from "@/hooks/useDateFormatter";
import { InputGroup, InputGroupAddon, InputGroupInput } from "./ui/input-group";
import { isSameDay } from "date-fns";

type Props = {
  onChange?: (task: Task) => void;
  start?: string | null;
  end?: string | null;
  onRangeChange?: (start: string | null, end: string | null) => void;
  placeholder?: string;
};

export function DatePickerInput({
  onChange = () => {},
  start,
  end,
  onRangeChange,
  placeholder = "Select a date",
}: Props) {
  const { state: task, setState: setTask } = useContext(TaskContext);
  const isControlled = onRangeChange !== undefined;

  const plannedStart = isControlled ? start ?? null : task.TimePlannedStart;
  const plannedEnd = isControlled ? end ?? null : task.TimePlannedEnd;

  const [open, setOpen] = useState(false);

  const [date, setDate] = useState<DateRange | undefined>({
    from: plannedStart !== null ? new Date(plannedStart) : undefined,
    to: plannedEnd !== null ? new Date(plannedEnd) : undefined,
  });
  const [month, setMonth] = useState<Date | undefined>(undefined);

  const { toFormatted } = useDateFormat();

  const getTimeFromISO = (iso: string | null) => {
    if (!iso) return "";
    const date = new Date(iso);
    return date.toTimeString().slice(0, 5);
  };

  const setTimeOnDate = (isoDate: string | null, time: string) => {
    if (!isoDate || !time) return isoDate;
    const date = new Date(isoDate);
    const [hours, minutes] = time.split(":");
    date.setHours(parseInt(hours), parseInt(minutes));
    return date.toISOString();
  };

  const emit = (newStart: string | null, newEnd: string | null) => {
    if (isControlled) {
      onRangeChange(newStart, newEnd);
      return;
    }
    setTask({ ...task, TimePlannedStart: newStart, TimePlannedEnd: newEnd });
    onChange({ ...task, TimePlannedStart: newStart, TimePlannedEnd: newEnd });
  };

  const handleTimeChange = (type: "start" | "end", time: string) => {
    const newStart =
      type === "start" ? setTimeOnDate(plannedStart, time) : plannedStart;
    const newEnd =
      type === "end" ? setTimeOnDate(plannedEnd, time) : plannedEnd;
    emit(newStart, newEnd);
  };

  const selectedDate = () => {
    if (plannedStart === null) {
      return (
        <span className="font-normal text-neutral-400">{placeholder}</span>
      );
    }

    const hasEndDate =
      plannedEnd !== null && !isSameDay(plannedStart, plannedEnd);

    return (
      <span className="flex align-middle font-normal">
        {toFormatted(plannedStart)}

        {hasEndDate && " → "}
        {hasEndDate && toFormatted(plannedEnd)}
      </span>
    );
  };

  return (
    <div className="relative flex gap-2 grow">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            id="date-picker"
            variant="outline"
            className="flex grow justify-start placeholder:"
          >
            <CalendarIcon className="size-3.5" />
            {selectedDate()}
          </Button>
        </PopoverTrigger>
        <PopoverContent
          className="flex flex-col w-auto overflow-hidden p-2 gap-3"
          align="start"
          alignOffset={-8}
          sideOffset={10}
        >
          <Calendar
            mode="range"
            className="p-0"
            selected={date}
            captionLayout="dropdown"
            month={month}
            onMonthChange={setMonth}
            onSelect={(date) => {
              setDate(date);
              const existingTimeStart = getTimeFromISO(plannedStart);
              const existingTimeEnd = getTimeFromISO(plannedEnd);

              const newStart = date?.from
                ? setTimeOnDate(date.from.toISOString(), existingTimeStart)
                : null;
              const newEnd = date?.to
                ? setTimeOnDate(date.to.toISOString(), existingTimeEnd)
                : null;

              emit(newStart, newEnd);
            }}
          />
          <InputGroup>
            <InputGroupAddon>
              <ClockIcon />
            </InputGroupAddon>
            <InputGroupInput
              className="w-full"
              id="timeStart"
              type="time"
              value={getTimeFromISO(plannedStart)}
              onChange={(e) => handleTimeChange("start", e.target.value)}
            />
          </InputGroup>

          <InputGroup>
            <InputGroupAddon>
              <ClockCheckIcon />
            </InputGroupAddon>
            <InputGroupInput
              className="w-full"
              id="timeEnd"
              type="time"
              value={getTimeFromISO(plannedEnd)}
              onChange={(e) => handleTimeChange("end", e.target.value)}
            />
          </InputGroup>
        </PopoverContent>
      </Popover>
    </div>
  );
}
