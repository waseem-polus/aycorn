import { DateRangePicker } from "@/components/ui/date-range-picker";
import type { UpcomingFilters } from "@/features/upcoming/hooks/useUpcomingFilters";

type Props = {
  label: string;
  fromKey: string;
  toKey: string;
  dates: UpcomingFilters["dates"];
  onSet: (key: string, value: string) => void;
  onClear: () => void;
};

export function DateRangeSection({
  label,
  fromKey,
  toKey,
  dates,
  onSet,
  onClear,
}: Props) {
  const from = dates[fromKey as keyof typeof dates] ?? "";
  const to = dates[toKey as keyof typeof dates] ?? "";

  return (
    <div className="flex flex-col gap-1.5">
      <DateRangePicker
        from={from || null}
        to={to || null}
        placeholder={label}
        onRangeChange={(newFrom, newTo) => {
          onSet(fromKey, newFrom ?? "");
          onSet(toKey, newTo ?? "");
          if (!newFrom && !newTo) onClear();
        }}
      />
    </div>
  );
}
