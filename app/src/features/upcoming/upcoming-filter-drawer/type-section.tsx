import { MultiSelectCombobox } from "@/components/ui/multi-select-combobox";
import type { UpcomingFilters } from "@/features/upcoming/hooks/useUpcomingFilters";
import type { TaskTypeGlobal } from "@/types/types";

type Props = {
  taskTypes: TaskTypeGlobal[];
  selected: UpcomingFilters["type"];
  onToggle: (key: string | number) => void;
  onClear: () => void;
};

export function TypeSection({ taskTypes, selected, onToggle, onClear }: Props) {
  return (
    <div className="flex flex-col gap-1.5">
      <MultiSelectCombobox
        label="Type"
        icon="shapes"
        options={taskTypes.map((t) => ({ key: t.ID, label: t.Name }))}
        selected={selected}
        onToggle={onToggle}
        onClear={onClear}
      />
    </div>
  );
}
