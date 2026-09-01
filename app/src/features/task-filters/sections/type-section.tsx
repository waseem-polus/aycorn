import { DynamicIcon, type IconName } from "lucide-react/dynamic";
import { MultiSelectCombobox } from "@/components/ui/multi-select-combobox";
import { stageStrokeClass } from "@/features/stage/stage-visual";
import { cn } from "@/lib/utils";
import type { TaskFilterState } from "@/features/task-filters/task-filters";
import type { TaskType, TaskTypeCategory } from "@/types/types";

type Props = {
  taskTypes: TaskType[];
  categories: TaskTypeCategory[];
  selected: TaskFilterState["type"];
  onToggle: (key: string | number) => void;
  onClear: () => void;
};

export function TypeSection({ taskTypes, categories, selected, onToggle, onClear }: Props) {
  const groups = categories
    .map((c) => ({
      label: c.Name,
      options: taskTypes
        .filter((t) => t.Category === c.ID)
        .map((t) => ({
          key: t.ID,
          label: t.Name,
          lead: (
            <DynamicIcon
              name={t.Icon as IconName}
              className={cn("size-3.5 shrink-0", stageStrokeClass(t.Color))}
              fallback={() => <span className="size-3.5" />}
            />
          ),
        })),
    }))
    .filter((g) => g.options.length > 0);

  return (
    <div className="flex flex-col gap-1.5">
      <MultiSelectCombobox
        label="Task Type"
        icon="shapes"
        groups={groups}
        selected={selected}
        onToggle={onToggle}
        onClear={onClear}
      />
    </div>
  );
}
