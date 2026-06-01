import { MultiSelectCombobox } from "@/components/ui/multi-select-combobox";
import { StageIcon } from "@/features/stage/stage-visual";
import type { UpcomingFilters } from "@/features/upcoming/hooks/useUpcomingFilters";
import type { Stage } from "@/types/types";

type Props = {
  stages: Stage[];
  selected: UpcomingFilters["stage"];
  onToggle: (key: string | number) => void;
  onClear: () => void;
};

export function StatusSection({ stages, selected, onToggle, onClear }: Props) {
  return (
    <div className="flex flex-col gap-1.5">
      <MultiSelectCombobox
        label="Status"
        icon="land-plot"
        options={stages.map((s) => ({
          key: s.ID,
          label: s.Name,
          lead: <StageIcon stage={s} className="size-3.5 flex-shrink-0" />,
        }))}
        selected={selected}
        onToggle={onToggle}
        onClear={onClear}
      />
    </div>
  );
}
