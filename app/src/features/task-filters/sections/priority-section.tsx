import { MultiSelectCombobox } from "@/components/ui/multi-select-combobox";
import { priorityOptionSource } from "@/features/task-filters/option-groups";
import type { TaskFilterState } from "@/features/task-filters/task-filters";

type Props = {
  selected: TaskFilterState["priority"];
  onToggle: (key: string | number) => void;
  onClear: () => void;
};

export function PrioritySection({ selected, onToggle, onClear }: Props) {
  return (
    <div className="flex flex-col gap-1.5">
      <MultiSelectCombobox
        label="Priority"
        icon="signal"
        {...priorityOptionSource()}
        selected={selected}
        onToggle={onToggle}
        onClear={onClear}
      />
    </div>
  );
}
