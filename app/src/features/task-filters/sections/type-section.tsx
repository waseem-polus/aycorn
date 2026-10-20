import { MultiSelectCombobox } from "@/components/ui/multi-select-combobox";
import { taskTypeOptionSource } from "@/features/task-filters/option-groups";
import type { TaskFilterState } from "@/features/task-filters/task-filters";
import type { TaskType, TaskTypeCategory } from "@/types/types";

type Props = {
  taskTypes: TaskType[];
  categories: TaskTypeCategory[];
  selected: TaskFilterState["type"];
  onToggle: (key: string | number) => void;
  onClear: () => void;
};

export function TypeSection({ taskTypes, categories, selected, onToggle, onClear }: Props) {
  return (
    <div className="flex flex-col gap-1.5">
      <MultiSelectCombobox
        label="Task Type"
        icon="shapes"
        {...taskTypeOptionSource(taskTypes, categories)}
        selected={selected}
        onToggle={onToggle}
        onClear={onClear}
      />
    </div>
  );
}
