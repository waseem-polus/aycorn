import { DynamicIcon, type IconName } from "lucide-react/dynamic";
import type {
  MultiSelectOption,
  MultiSelectOptionGroup,
} from "@/components/ui/multi-select-combobox";
import { ProjectIcon } from "@/features/projects/project-icon";
import { StageIcon, stageStrokeClass } from "@/features/stage/stage-visual";
import TaskPriorityIcon from "@/features/task/properties/icons/TaskPriorityIcon";
import { cn } from "@/lib/utils";
import {
  PRIORITIES,
  type ChecklistFacet,
  type Project,
  type Stage,
  type TaskType,
  type TaskTypeCategory,
} from "@/types/types";

/**
 * The selectable values for one filterable property, either grouped or flat.
 * Shared by the basic filter sections and the condition builder's value
 * picker so both list the same options with the same icons.
 */
export type OptionSource = {
  groups?: MultiSelectOptionGroup[];
  options?: MultiSelectOption[];
};

export const allSourceOptions = (source: OptionSource): MultiSelectOption[] =>
  source.groups ? source.groups.flatMap((g) => g.options) : (source.options ?? []);

export const projectOptionSource = (projects: Project[]): OptionSource => ({
  groups: Object.entries(
    projects.reduce<Record<string, MultiSelectOption[]>>((acc, p) => {
      (acc[p.WorkflowName] ??= []).push({
        key: p.ID,
        label: p.Name,
        lead: <ProjectIcon project={p} className="size-3.5" />,
      });
      return acc;
    }, {}),
  ).map(([label, options]) => ({ label, options })),
});

const stageOption = (stage: Stage): MultiSelectOption => ({
  key: stage.ID,
  label: stage.Name,
  lead: <StageIcon stage={stage} className="size-3.5 flex-shrink-0" />,
});

/** Grouped by workflow only when there's more than one — a single workflow's name would just sit above every option. */
export const stageOptionSource = (
  stages: Stage[],
  workflows?: { ID: number; Name: string }[],
): OptionSource => {
  if ((workflows?.length ?? 0) <= 1) return { options: stages.map(stageOption) };
  return {
    groups: workflows!
      .map((w) => ({
        label: w.Name,
        options: stages.filter((s) => s.Workflow === w.ID).map(stageOption),
      }))
      .filter((g) => g.options.length > 0),
  };
};

export const taskTypeOptionSource = (
  taskTypes: TaskType[],
  categories: TaskTypeCategory[],
): OptionSource => ({
  groups: categories
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
    .filter((g) => g.options.length > 0),
});

export const priorityOptionSource = (): OptionSource => ({
  options: PRIORITIES.map((p) => ({
    key: p,
    label: p,
    lead: <TaskPriorityIcon variant={p} className="size-3.5" />,
  })),
});

export const assigneeOptionSource = (assignees: string[]): OptionSource => ({
  options: assignees.map((a) => ({ key: a, label: a })),
});

/** Grouped by project when checklists span projects; flat within one project. */
export const checklistOptionSource = (
  checklists: ChecklistFacet[],
  projects?: Project[],
): OptionSource => {
  if (!projects) {
    return { options: checklists.map((c) => ({ key: c.id, label: c.name })) };
  }
  return {
    groups: projects
      .map((p) => ({
        label: p.Name,
        options: checklists
          .filter((c) => c.projectId === p.ID)
          .map((c) => ({ key: c.id, label: c.name })),
      }))
      .filter((g) => g.options.length > 0),
  };
};
