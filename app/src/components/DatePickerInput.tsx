import { useContext } from "react";
import { TaskContext } from "@/contexts/task/TaskContext";
import type { ChecklistTask, Task } from "@/types/types";
import { DateRangePicker } from "@/components/ui/date-range-picker";

type Props = {
  onChange?: (task: Task) => void;
  start?: string | null;
  end?: string | null;
  onRangeChange?: (start: string | null, end: string | null) => void;
  placeholder?: string;
};

export function DatePickerInput({
  onChange,
  start,
  end,
  onRangeChange,
  placeholder = "Select Date",
}: Props) {
  const { state: task, setState: setTask } = useContext(TaskContext);
  const isControlled = onRangeChange !== undefined;

  const from = isControlled ? (start ?? null) : task.TimePlannedStart;
  const to = isControlled ? (end ?? null) : task.TimePlannedEnd;
  const hasFromTime = isControlled ? false : task.HasTimePlannedStart;
  const hasToTime = isControlled ? false : task.HasTimePlannedEnd;

  const handleChange = (
    newFrom: string | null,
    newTo: string | null,
    newHasFromTime = hasFromTime,
    newHasToTime = hasToTime,
  ) => {
    if (isControlled) {
      onRangeChange(newFrom, newTo);
      return;
    }
    const updated: ChecklistTask = {
      ...task,
      TimePlannedStart: newFrom,
      TimePlannedEnd: newTo,
      HasTimePlannedStart: newHasFromTime,
      HasTimePlannedEnd: newHasToTime,
    };
    setTask(updated);
    onChange?.(updated);
  };

  return (
    <DateRangePicker
      mode="datetime"
      from={from}
      to={to}
      hasFromTime={hasFromTime}
      hasToTime={hasToTime}
      placeholder={placeholder}
      onRangeChange={handleChange}
    />
  );
}
