import { MultiSelectCombobox } from "@/components/ui/multi-select-combobox";
import type { UpcomingFilters } from "@/features/upcoming/hooks/useUpcomingFilters";
import type { Project } from "@/types/types";

type Props = {
  projects: Project[];
  selected: UpcomingFilters["project"];
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
    projects.reduce<Record<string, { key: number; label: string }[]>>(
      (acc, p) => {
        (acc[p.WorkflowName] ??= []).push({ key: p.ID, label: p.Name });
        return acc;
      },
      {},
    ),
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
