import {
  MultiSelectCombobox,
  type MultiSelectOption,
  type MultiSelectOptionGroup,
} from "@/components/ui/multi-select-combobox";
import type { TaskFilterState } from "@/features/task-filters/task-filters";

type Props = {
  /** Grouped when checklists span projects; flat `options` within one project. */
  groups?: MultiSelectOptionGroup[];
  options?: MultiSelectOption[];
  selected: TaskFilterState["checklist"];
  onToggle: (key: string | number) => void;
  onClear: () => void;
};

export function ChecklistSection({
  groups,
  options,
  selected,
  onToggle,
  onClear,
}: Props) {
  return (
    <div className="flex flex-col gap-1.5">
      <MultiSelectCombobox
        label="Checklist"
        icon="land-plot"
        groups={groups}
        options={options}
        selected={selected}
        onToggle={onToggle}
        onClear={onClear}
      />
    </div>
  );
}
