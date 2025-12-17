import { useContext, useState } from "react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { TaskContext } from "@/contexts/task/TaskContext";
import type { Task } from "@/types/types";

function formatDate(date: Date | undefined) {
  if (!date) {
    return "";
  }

  return date.toLocaleDateString("en-US", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

function isValidDate(date: Date | undefined) {
  if (!date) {
    return false;
  }
  return !isNaN(date.getTime());
}

export function DatePickerInput({
  onChange = () => {},
}: {
  onChange?: (task: Task) => void;
}) {
  const { state: task, setState: setTask } = useContext(TaskContext);

  console.log(task.Name, task.ID);

  const [open, setOpen] = useState(false);

  const [date, setDate] = useState<Date | undefined>(undefined);
  const [month, setMonth] = useState<Date | undefined>(date);

  return (
    <div className="relative flex gap-2 grow">
      <Input
        id="date"
        value={
          task.TimePlanned === null
            ? ""
            : new Date(task.TimePlanned).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              })
        }
        placeholder={formatDate(new Date())}
        className="bg-background pl-10 placeholder:text-neutral-400"
        onBlur={(e) =>
          onChange({
            ...task,
            TimePlanned: e.target.value,
          })
        }
        onChange={(e) => {
          const date = new Date(e.target.value);
          setTask({
            ...task,
            TimePlanned: e.target.value,
          });
          if (isValidDate(date)) {
            setDate(date);
            setMonth(date);
          }
        }}
        onKeyDown={(e) => {
          if (e.key === "ArrowDown") {
            e.preventDefault();
            setOpen(true);
          }
        }}
      />
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            id="date-picker"
            variant="ghost"
            className="absolute top-1/2 left-2 size-6 -translate-y-1/2"
          >
            <CalendarIcon className="size-3.5" />
            <span className="sr-only">Select date</span>
          </Button>
        </PopoverTrigger>
        <PopoverContent
          className="w-auto overflow-hidden p-0"
          align="start"
          alignOffset={-8}
          sideOffset={10}
        >
          <Calendar
            mode="single"
            selected={date}
            captionLayout="dropdown"
            month={month}
            onMonthChange={setMonth}
            onSelect={(date) => {
              setDate(date);
              setTask({
                ...task,
                TimePlanned: date?.toISOString() ?? null,
              });
              onChange({
                ...task,
                TimePlanned: date?.toISOString() ?? null,
              });
              setOpen(false);
            }}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}
