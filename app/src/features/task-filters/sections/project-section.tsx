import {
  MultiSelectCombobox,
  type MultiSelectOption,
} from "@/components/ui/multi-select-combobox";
import { ProjectIcon } from "@/features/projects/project-icon";
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
  const groups = Object.entries(
    projects.reduce<Record<string, MultiSelectOption[]>>((acc, p) => {
      (acc[p.WorkflowName] ??= []).push({
        key: p.ID,
        label: p.Name,
        lead: <ProjectIcon project={p} className="size-3.5" />,
      });
      return acc;
    }, {}),
  ).map(([label, options]) => ({ label, options }));

  return (
    <div className="flex flex-col gap-1.5">
      <MultiSelectCombobox
        label="Project"
        icon="folder"
        groups={groups}
        selected={selected}
        onToggle={onToggle}
        onClear={onClear}
      />
    </div>
  );
}
