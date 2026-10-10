import { MultiSelectCombobox } from "@/components/ui/multi-select-combobox";
import { StageIcon } from "@/features/stage/stage-visual";
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

const stageOption = (stage: Stage) => ({
  key: stage.ID,
  label: stage.Name,
  lead: <StageIcon stage={stage} className="size-3.5 flex-shrink-0" />,
});

export function StatusSection({
  stages,
  workflows,
  selected,
  onToggle,
  onClear,
}: Props) {
  // One workflow needs no group header — its name would sit above every option.
  const grouped = (workflows?.length ?? 0) > 1;
  const groups = grouped
    ? workflows!
        .map((w) => ({
          label: w.Name,
          options: stages.filter((s) => s.Workflow === w.ID).map(stageOption),
        }))
        .filter((g) => g.options.length > 0)
    : undefined;

  return (
    <div className="flex flex-col gap-1.5">
      <MultiSelectCombobox
        label="Status"
        icon="layers-2"
        groups={groups}
        options={grouped ? undefined : stages.map(stageOption)}
        selected={selected}
        onToggle={onToggle}
        onClear={onClear}
      />
    </div>
  );
}
