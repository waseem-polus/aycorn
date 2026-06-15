import { useContext, useMemo } from "react";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Skeleton } from "@/components/ui/skeleton";
import { TaskContext } from "@/contexts/task/TaskContext";
import { useAllTasksForRelationshipQuery } from "@/features/task/relationships/queries/useAllTasksForRelationshipQuery";
import { useAllProjectsQuery } from "@/queries/useAllProjectsQuery";
import { useAllStagesQuery } from "@/features/stage/queries/useAllStagesQuery";
import { WorkflowStageChip } from "@/features/workflows/shared/workflow-stage-chip";
import type { Project, Stage, TaskWithProject } from "@/types/types";
import TaskPriorityIcon from "../../properties/icons/TaskPriorityIcon";
import TaskTypeBadge from "../../properties/task-type-badge";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  excludeTaskIds: Set<number>;
  onSelect: (task: TaskWithProject) => void;
  trigger: React.ReactNode;
};

export function SelectRelationshipTask({
  open,
  onOpenChange,
  excludeTaskIds,
  onSelect,
  trigger,
}: Props) {
  const { state: currentTask } = useContext(TaskContext);
  const { data: tasks = [], isLoading: tasksLoading } =
    useAllTasksForRelationshipQuery(open);
  const { data: projects = [] } = useAllProjectsQuery();
  const { data: stages = [] } = useAllStagesQuery();

  const projectById = useMemo(
    () => new Map<number, Project>(projects.map((p: Project) => [p.ID, p])),
    [projects],
  );

  const stageById = useMemo(
    () => new Map<number, Stage>(stages.map((s: Stage) => [s.ID, s])),
    [stages],
  );

  const tasksByProject = useMemo(() => {
    const filtered = tasks.filter(
      (t) => t.ID !== currentTask.ID && !excludeTaskIds.has(t.ID),
    );
    const groups = new Map<number, TaskWithProject[]>();
    for (const task of filtered) {
      const list = groups.get(task.ProjectID) ?? [];
      list.push(task);
      groups.set(task.ProjectID, list);
    }
    return groups;
  }, [tasks, currentTask.ID, excludeTaskIds]);

  const handleSelect = (task: TaskWithProject) => {
    onOpenChange(false);
    onSelect(task);
  };

  return (
    <Popover open={open} onOpenChange={onOpenChange}>
      <PopoverTrigger asChild>{trigger}</PopoverTrigger>
      <PopoverContent className="w-80 sm:min-w-lg p-0" align="end">
        <Command>
        <CommandInput placeholder="Search tasks..." />
          <CommandList>
            {tasksLoading ? (
              <div className="flex flex-col gap-2 p-2">
                <Skeleton className="h-8 w-full" />
                <Skeleton className="h-8 w-full" />
                <Skeleton className="h-8 w-full" />
              </div>
            ) : tasksByProject.size === 0 ? (
              <CommandEmpty>No tasks found.</CommandEmpty>
            ) : (
              Array.from(tasksByProject.entries()).map(
                ([projectId, projectTasks]) => {
                  const project = projectById.get(projectId);
                  return (
                    <CommandGroup
                      key={projectId}
                      heading={project?.Name ?? `Project ${projectId}`}
                      className="border-b"
                    >
                      {projectTasks.map((task) => {
                        const stage = stageById.get(
                          task.Stage as unknown as number,
                        );
                        return (
                            <CommandItem
                                key={task.ID}
                                value={`${task.Name} ${project?.Name ?? ""}`}
                                onSelect={() => handleSelect(task)}
                                className="flex flex-row gap-3 py-2 items-center"
                            >
                                <TaskPriorityIcon variant={task.Priority}  />

                                <span className="flex-1 truncate text-sm">
                                    {task.Name || "Untitled Task"}
                                </span>

                                <span className="flex gap-2">
                                    {stage && (
                                        <WorkflowStageChip stage={stage} className="shrink-0 text-xs" />
                                    )}
                                    <TaskTypeBadge type={task.Type} />
                                </span>
                            </CommandItem>
                        );
                      })}
                    </CommandGroup>
                  );
                },
              )
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
