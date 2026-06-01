import { MultiSelectCombobox } from "@/components/ui/multi-select-combobox";
import type { UpcomingFilters } from "@/features/upcoming/hooks/useUpcomingFilters";

type Props = {
  checklists: { key: number; label: string; sublabel?: string }[];
  selected: UpcomingFilters["checklist"];
  onToggle: (key: string | number) => void;
  onClear: () => void;
};

export function ChecklistSection({
  checklists,
  selected,
  onToggle,
  onClear,
}: Props) {
  return (
    <div className="flex flex-col gap-1.5">
      <MultiSelectCombobox
        label="Checklist"
        icon="list-checks"
        options={checklists}
        selected={selected}
        onToggle={onToggle}
        onClear={onClear}
      />
    </div>
  );
}
