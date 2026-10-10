import { DateRangePicker } from "@/components/ui/date-range-picker";
import type { TaskFilterState } from "@/features/task-filters/task-filters";

type Props = {
  label: string;
  fromKey: string;
  toKey: string;
  hasFromTimeKey: string;
  hasToTimeKey: string;
  dates: TaskFilterState["dates"];
  mode?: "date" | "datetime";
  onSet: (key: string, value: string) => void;
  onSetHasTime: (key: string, value: boolean) => void;
};

export function DateRangeSection({
  label,
  fromKey,
  toKey,
  hasFromTimeKey,
  hasToTimeKey,
  dates,
  mode = "date",
  onSet,
  onSetHasTime,
}: Props) {
  const from = dates[fromKey as keyof typeof dates] as string | undefined;
  const to = dates[toKey as keyof typeof dates] as string | undefined;
  const hasFromTime = (dates[hasFromTimeKey as keyof typeof dates] as boolean | undefined) ?? false;
  const hasToTime = (dates[hasToTimeKey as keyof typeof dates] as boolean | undefined) ?? false;

  return (
    <DateRangePicker
      from={from ?? null}
      to={to ?? null}
      hasFromTime={hasFromTime}
      hasToTime={hasToTime}
      mode={mode}
      placeholder={label}
      onRangeChange={(newFrom, newTo, newHasFromTime, newHasToTime) => {
        onSet(fromKey, newFrom ?? "");
        onSet(toKey, newTo ?? "");
        onSetHasTime(hasFromTimeKey, newHasFromTime ?? false);
        onSetHasTime(hasToTimeKey, newHasToTime ?? false);
      }}
    />
  );
}
