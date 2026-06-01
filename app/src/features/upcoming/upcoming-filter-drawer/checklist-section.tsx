import {
  MultiSelectCombobox,
  type MultiSelectOptionGroup,
} from "@/components/ui/multi-select-combobox";
import type { UpcomingFilters } from "@/features/upcoming/hooks/useUpcomingFilters";

type Props = {
  groups: MultiSelectOptionGroup[];
  selected: UpcomingFilters["checklist"];
  onToggle: (key: string | number) => void;
  onClear: () => void;
};

export function ChecklistSection({ groups, selected, onToggle, onClear }: Props) {
  return (
    <div className="flex flex-col gap-1.5">
      <MultiSelectCombobox
        label="Checklist"
        icon="list-checks"
        groups={groups}
        selected={selected}
        onToggle={onToggle}
        onClear={onClear}
      />
    </div>
  );
}
