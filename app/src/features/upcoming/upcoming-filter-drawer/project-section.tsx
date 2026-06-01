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
  return (
    <div className="flex flex-col gap-1.5">
      <MultiSelectCombobox
        label="Project"
        icon="folder"
        options={projects.map((p) => ({ key: p.ID, label: p.Name }))}
        selected={selected}
        onToggle={onToggle}
        onClear={onClear}
      />
    </div>
  );
}
