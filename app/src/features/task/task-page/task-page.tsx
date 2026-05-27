import { useContext, useEffect, useState } from "react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ChevronDown, LandPlotIcon, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { TaskContext } from "@/contexts/task/TaskContext";
import { ProjectContext } from "@/contexts/project/ProjectContext";
import { EditableTaskName } from "@/features/task/header/editable-task-name";
import { SelectChecklist } from "@/features/task/properties/select-checklist";
import { SelectTaskStage } from "@/features/stage/select-task-stage";
import { SelectTaskType } from "@/features/task/properties/select-task-type";
import { SelectTaskPriority } from "@/features/task/properties/select-task-priority";
import { TaskProperty } from "@/features/task/properties/task-property";
import { TaskAssignee } from "@/features/task/properties/task-assignee";
import { TaskPlannedDates } from "@/features/task/properties/task-planned-dates";
import { DatePickerInput } from "@/components/DatePickerInput";
import { RichEditor } from "@/features/editor/rich-editor";
import { useProjectDetailsQuery } from "@/queries/useProjectDetailsQuery";
import { useTaskMutation } from "@/queries/useTaskMutation";
import { defaultProjectContextValue } from "@/contexts/project/ProjectContext";
import type { Task } from "@/types/types";
import type { Value } from "platejs";
import TaskPriorityIcon from "../properties/icons/TaskPriorityIcon";
import TaskTypeBadge from "../properties/task-type-badge";
import { WorkflowStageChip } from "@/features/workflows/shared/workflow-stage-chip";

export function TaskPage({ projectId }: { projectId: number }) {
  const { state: task, setState: setTask } = useContext(TaskContext);
  const {
    SetProject,
    SetWorkflow,
    SetStages,
    SetChecklists,
    SetTasks,
    Stages,
  } = useContext(ProjectContext);
  const { update } = useTaskMutation(projectId);
  const [propertiesOpen, setPropertiesOpen] = useState(true);

  const { isPending, isFetching, data } = useProjectDetailsQuery(
    projectId,
    defaultProjectContextValue.Filter,
    true,
  );

  useEffect(() => {
    if (data && !isPending && !isFetching) {
      SetTasks(data.Tasks);
      SetChecklists(data.Checklists);
      SetProject(data.Project);
      SetWorkflow(data.Workflow);
      SetStages(data.Stages);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data, isFetching, isPending]);

  const handleTaskChanges = (updatedTask: Task) => {
    update.mutate(updatedTask);
  };

  const handleEditorValueChange = (value: Value) => {
    const updated = { ...task, Body: value };
    setTask(updated);
    handleTaskChanges(updated);
  };

  if (isPending) {
    return (
      <div className="flex flex-col gap-4 p-3 sm:p-6 max-w-4xl w-full">
        <Skeleton className="h-8 w-2/3" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2 w-full">
      <Collapsible open={propertiesOpen} onOpenChange={setPropertiesOpen}>
        <div className="flex items-start gap-1">
          <EditableTaskName onChange={handleTaskChanges} />
          <CollapsibleTrigger asChild>
            <Button variant="ghost" size="icon" className="shrink-0 self-start">
              <ChevronDown
                className={cn(
                  "transition-transform duration-200",
                  propertiesOpen && "rotate-180",
                )}
              />
            </Button>
          </CollapsibleTrigger>
        </div>

        {!propertiesOpen && (
          <div className="flex flex-wrap items-center gap-1.5 pb-2">
            <TaskPriorityIcon variant={task.Priority} />
            <TaskTypeBadge variant={task.Type} />
            {Stages.find((s) => s.ID === task.Stage) && (
              <WorkflowStageChip
                className="rounded-full"
                stage={Stages.find((s) => s.ID === task.Stage)!}
              />
            )}
            <Badge variant="outline">
              <LandPlotIcon className="size-2" />
              {task.ChecklistName}
            </Badge>
            <Badge
              variant={task.Assignee !== "" ? "secondary" : "outline"}
              className={task.Assignee !== "" ? "" : "text-muted-foreground"}
            >
              <User className="size-2" />
              {task.Assignee !== "" ? task.Assignee : "Not Assigned"}
            </Badge>
            <TaskPlannedDates
              start={task.TimePlannedStart}
              end={task.TimePlannedEnd}
              hasStartTime={task.HasTimePlannedStart}
              hasEndTime={task.HasTimePlannedEnd}
            />
          </div>
        )}

        <CollapsibleContent className="border pl-3 p-2 sm:p-5 rounded-lg overflow-hidden data-[state=open]:animate-collapsible-down data-[state=closed]:animate-collapsible-up my-2">
          <section className="flex flex-col gap-2">
            <TaskProperty label="Priority" htmlFor="priority">
              <SelectTaskPriority onChange={handleTaskChanges} />
            </TaskProperty>
            <TaskProperty label="Type" htmlFor="type">
              <SelectTaskType onChange={handleTaskChanges} />
            </TaskProperty>
            <TaskProperty label="Stage" htmlFor="stage">
              <SelectTaskStage onChange={handleTaskChanges} />
            </TaskProperty>
            <TaskProperty label="Checklist" htmlFor="checklist">
              <SelectChecklist onChange={handleTaskChanges} />
            </TaskProperty>
            <TaskProperty label="Assignee" htmlFor="assignee">
              <TaskAssignee onChange={handleTaskChanges} />
            </TaskProperty>
            <TaskProperty label="Date" htmlFor="date">
              <DatePickerInput onChange={handleTaskChanges} />
            </TaskProperty>
          </section>
        </CollapsibleContent>
      </Collapsible>

      <RichEditor
        key={task.ID}
        onDebounceChange={handleEditorValueChange}
        debounceDuration={250}
        initialValue={task.Body && task.Body.length > 0 ? task.Body : []}
        className="px-2"
      />
    </div>
  );
}
