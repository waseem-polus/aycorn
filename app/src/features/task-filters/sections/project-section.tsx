import { MultiSelectCombobox } from "@/components/ui/multi-select-combobox";
import { projectOptionSource } from "@/features/task-filters/option-groups";
import type { TaskFilterState } from "@/features/task-filters/task-filters";
import type { Project } from "@/types/types";

type Props = {
  projects: Project[];
  selected: TaskFilterState["project"];
  onToggle: (key: string | number) => void;
  onClear: () => void;
};

export function ProjectSection({
  projects,
  selected,
  onToggle,
  onClear,
}: Props) {
  return (
    <div className="flex flex-col gap-1.5">
      <MultiSelectCombobox
        label="Project"
        icon="folder"
        {...projectOptionSource(projects)}
        selected={selected}
        onToggle={onToggle}
        onClear={onClear}
      />
    </div>
  );
}
