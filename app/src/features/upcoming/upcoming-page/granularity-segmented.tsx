import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import type { Granularity } from "@/features/upcoming/hooks/useUpcomingFilters";

const GRANULARITIES: Granularity[] = ["day", "week", "month"];
const GRAN_LABEL: Record<Granularity, string> = { day: "Day", week: "Week", month: "Month" };

type Props = {
  value: Granularity;
  onChange: (v: Granularity) => void;
};

export function GranularitySegmented({ value, onChange }: Props) {
  return (
    <ToggleGroup
      type="single"
      value={value}
      onValueChange={(v) => { if (v) onChange(v as Granularity); }}
      variant="outline"
    >
      {GRANULARITIES.map((g) => (
        <ToggleGroupItem key={g} value={g} className="text-sm px-3">
          {GRAN_LABEL[g]}
        </ToggleGroupItem>
      ))}
    </ToggleGroup>
  );
}
