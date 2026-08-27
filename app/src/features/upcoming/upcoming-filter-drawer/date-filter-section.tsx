import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DateRangeSection } from "@/features/upcoming/upcoming-filter-drawer/date-range-section";
import type {
  DateFilterMode,
  DateModeKey,
  UpcomingFilters,
} from "@/features/upcoming/hooks/useUpcomingFilters";
import { CalendarsIcon, CalendarXIcon, CalendarCheckIcon } from "lucide-react";

type Props = {
  label: string;
  modeKey: DateModeKey;
  /** Labels for "all" / "none" / "with", worded for this specific date. */
  modeLabels: Record<DateFilterMode, string>;
  fromKey: string;
  toKey: string;
  hasFromTimeKey: string;
  hasToTimeKey: string;
  dates: UpcomingFilters["dates"];
  mode?: "date" | "datetime";
  onSet: (key: string, value: string) => void;
  onSetHasTime: (key: string, value: boolean) => void;
  onSetMode: (
    modeKey: DateModeKey,
    mode: DateFilterMode,
    fromKey: string,
    toKey: string,
  ) => void;
};

const MODES: DateFilterMode[] = ["all", "none", "with"];

export function DateFilterSection({
  label,
  modeKey,
  modeLabels,
  fromKey,
  toKey,
  hasFromTimeKey,
  hasToTimeKey,
  dates,
  mode = "date",
  onSet,
  onSetHasTime,
  onSetMode,
}: Props) {
    const selectedMode = dates[modeKey] ?? "all";
    const modeIcon = {
      "all": () => <CalendarsIcon />,
      "none": () => <CalendarXIcon />,
      "with": () => <CalendarCheckIcon />,
    }

  return (
    <div className="flex flex-col gap-2">
      <Select
        value={selectedMode}
        onValueChange={(v) =>
          onSetMode(modeKey, v as DateFilterMode, fromKey, toKey)
        }
      >
        <SelectTrigger className="w-full" aria-label={label}>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {MODES.map((m) => (
            <SelectItem key={m} value={m}>
              {modeIcon[m]()}
              {modeLabels[m]}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {selectedMode === "with" && (
        <div className="mb-2">
            <DateRangeSection
            label={label}
            fromKey={fromKey}
            toKey={toKey}
            hasFromTimeKey={hasFromTimeKey}
            hasToTimeKey={hasToTimeKey}
            mode={mode}
            dates={dates}
            onSet={onSet}
            onSetHasTime={onSetHasTime}
            />
        </div>
      )}
    </div>
  );
}
