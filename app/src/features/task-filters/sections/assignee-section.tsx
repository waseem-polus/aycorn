import { MultiSelectCombobox } from "@/components/ui/multi-select-combobox";
import type { TaskFilterState } from "@/features/task-filters/task-filters";

type Props = {
  assignees: string[];
  selected: TaskFilterState["assignee"];
  onToggle: (key: string | number) => void;
  onClear: () => void;
};

export function AssigneeSection({
  assignees,
  selected,
  onToggle,
  onClear,
}: Props) {
  return (
    <div className="flex flex-col gap-1.5">
      <MultiSelectCombobox
        label="Assignee"
        icon="user"
        options={[
          ...assignees.map((a) => ({ key: a, label: a })),
          { key: "", label: "Not assigned" },
        ]}
        selected={selected}
        onToggle={onToggle}
        onClear={onClear}
      />
    </div>
  );
}
