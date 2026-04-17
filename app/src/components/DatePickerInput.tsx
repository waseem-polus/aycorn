import { useContext, useState } from "react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { type DateRange } from "react-day-picker";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { TaskContext } from "@/contexts/task/TaskContext";
import type { Task } from "@/types/types";
import { useDateFormat } from "@/hooks/useDateFormatter";

export function DatePickerInput({
  onChange = () => {},
}: {
  onChange?: (task: Task) => void;
}) {
  const { state: task, setState: setTask } = useContext(TaskContext);

  const [open, setOpen] = useState(false);

  const [date, setDate] = useState<DateRange | undefined>(undefined);
  const [month, setMonth] = useState<Date | undefined>(undefined);

  const { toFormatted, toISO } = useDateFormat();

  const selectedDate = () => (
    <span className="flex align-middle font-normal">
      {toFormatted(task.TimePlannedStart)}

      {task.TimePlannedEnd !== null && " → "}
      {task.TimePlannedEnd !== null && toFormatted(task.TimePlannedEnd)}
    </span>
  );
  const placeholder = () => (
    <span className="font-normal text-neutral-400">Select a date</span>
  );

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
            {task.TimePlannedStart !== null ? selectedDate() : placeholder()}
          </Button>
        </PopoverTrigger>
        <PopoverContent
          className="w-auto overflow-hidden p-0"
          align="start"
          alignOffset={-8}
          sideOffset={10}
        >
          <Calendar
            mode="range"
            selected={date}
            captionLayout="dropdown"
            month={month}
            onMonthChange={setMonth}
            onSelect={(date) => {
              setDate(date);
              console.log(date);
              setTask({
                ...task,
                TimePlannedStart: date?.from?.toISOString() ?? null,
                TimePlannedEnd: date?.to?.toISOString() ?? null,
              });
              onChange({
                ...task,
                TimePlannedStart: date?.from?.toISOString() ?? null,
                TimePlannedEnd: date?.to?.toISOString() ?? null,
              });
            }}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}
