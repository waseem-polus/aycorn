import { MultiSelectCombobox } from "@/components/ui/multi-select-combobox";
import { StageIcon } from "@/features/stage/stage-visual";
import type { UpcomingFilters } from "@/features/upcoming/hooks/useUpcomingFilters";
import type { Stage, WorkflowSummary } from "@/types/types";

type Props = {
  stages: Stage[];
  workflows: WorkflowSummary[];
  selected: UpcomingFilters["stage"];
  onToggle: (key: string | number) => void;
  onClear: () => void;
};

export function StatusSection({ stages, workflows, selected, onToggle, onClear }: Props) {
  const groups = workflows
    .map((w) => ({
      label: w.Name,
      options: stages
        .filter((s) => s.Workflow === w.ID)
        .map((s) => ({
          key: s.ID,
          label: s.Name,
          lead: <StageIcon stage={s} className="size-3.5 flex-shrink-0" />,
        })),
    }))
    .filter((g) => g.options.length > 0);

  return (
    <div className="flex flex-col gap-1.5">
      <MultiSelectCombobox
        label="Status"
        icon="land-plot"
        groups={groups}
        selected={selected}
        onToggle={onToggle}
        onClear={onClear}
      />
    </div>
  );
}
