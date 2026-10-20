import { MultiSelectCombobox } from "@/components/ui/multi-select-combobox";
import { stageOptionSource } from "@/features/task-filters/option-groups";
import type { TaskFilterState } from "@/features/task-filters/task-filters";
import type { Stage } from "@/types/types";

type Props = {
  stages: Stage[];
  /** Omit on a single-workflow surface — the options then render ungrouped. */
  workflows?: { ID: number; Name: string }[];
  selected: TaskFilterState["stage"];
  onToggle: (key: string | number) => void;
  onClear: () => void;
};

export function StatusSection({
  stages,
  workflows,
  selected,
  onToggle,
  onClear,
}: Props) {
  return (
    <div className="flex flex-col gap-1.5">
      <MultiSelectCombobox
        label="Status"
        icon="layers-2"
        {...stageOptionSource(stages, workflows)}
        selected={selected}
        onToggle={onToggle}
        onClear={onClear}
      />
    </div>
  );
}
