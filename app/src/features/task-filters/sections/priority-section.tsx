import { MultiSelectCombobox } from "@/components/ui/multi-select-combobox";
import TaskPriorityIcon from "@/features/task/properties/icons/TaskPriorityIcon";
import type { TaskFilterState } from "@/features/task-filters/task-filters";
import { PRIORITIES } from "@/types/types";

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
        options={PRIORITIES.map((p) => ({
          key: p,
          label: p,
          lead: <TaskPriorityIcon variant={p} className="size-3.5" />,
        }))}
        selected={selected}
        onToggle={onToggle}
        onClear={onClear}
      />
    </div>
  );
}
