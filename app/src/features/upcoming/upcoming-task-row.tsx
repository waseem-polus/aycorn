import { useState } from "react";
import type { Stage, TaskWithProject, Project } from "@/types/types";
import { ProjectProvider } from "@/contexts/project/ProjectProvider";
import { TaskProvider } from "@/contexts/task/TaskProvider";
import TaskEditorDrawer from "@/features/task/task-editor-drawer";
import { UpcomingProjectDetailsLoader } from "@/features/upcoming/upcoming-project-details-loader";
import TaskPriorityIcon from "@/features/task/properties/icons/TaskPriorityIcon";
import TaskTypeBadge from "@/features/task/properties/task-type-badge";
import { WorkflowStageChip } from "@/features/workflows/shared/workflow-stage-chip";
import { TaskPlannedDates } from "@/features/task/properties/task-planned-dates";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { User } from "lucide-react";
import { cn } from "@/lib/utils";
import UpcomingRowProjectChecklist from "./upcoming-task-row/upcoming-row-project-checklist";

type Props = {
  task: TaskWithProject;
  stageById: Record<number, Stage>;
  project?: Project;
  selected: boolean;
  onToggleSelect: (id: number) => void;
};

function UpcomingTaskRowInner({
  task,
  stageById,
  project,
  selected,
  onToggleSelect,
}: Props) {
  const [open, setOpen] = useState(false);
  const today = new Date();
  const stage = stageById[task.Stage];
  const overdue =
    task.TimePlannedStart &&
    !task.TimeCompleted &&
    new Date(task.TimePlannedStart) <
      new Date(today.getFullYear(), today.getMonth(), today.getDate());

  return (
    <ProjectProvider defaultState={project}>
      <UpcomingProjectDetailsLoader projectId={task.ProjectID} open={open} />
      <TaskProvider defaultState={task}>
        <TaskEditorDrawer onOpenChange={setOpen}>
          <div
            data-task-card=""
            data-selected={selected}
            className={cn(
              "group flex items-center gap-3 px-3 py-2.5 border-b border-border cursor-pointer hover:bg-accent/50 transition-colors",
              selected && "bg-accent",
            )}
            onClick={() => setOpen(true)}
          >
            {/* Checkbox */}
            <div
              onClick={(e) => {
                e.stopPropagation();
                onToggleSelect(task.ID);
              }}
            >
              <Checkbox
                checked={selected}
                onCheckedChange={() => onToggleSelect(task.ID)}
              />
            </div>

            {/* Priority */}
            <TaskPriorityIcon variant={task.Priority} className="shrink-0" />

            {/* Name + project · checklist */}
            <span className="flex flex-col min-w-0 flex-1">
              <Tooltip>
                <TooltipTrigger asChild>
                  <span className="truncate text-sm font-medium">
                    {task.Name || "Untitled"}
                  </span>
                </TooltipTrigger>
                {task.Name && <TooltipContent>{task.Name}</TooltipContent>}
              </Tooltip>
              <UpcomingRowProjectChecklist />
            </span>

            {/* Stage chip */}
            <span className="flex-shrink-0 hidden sm:block">
              {stage ? (
                <WorkflowStageChip stage={stage} className="text-xs" />
              ) : null}
            </span>

            {/* Type badge */}
            <span className="flex-shrink-0 hidden md:block">
              <TaskTypeBadge type={task.Type} />
            </span>

            {/* Assignee */}
            <span className="flex-shrink-0 hidden lg:block">
              {task.Assignee ? (
                <span className="flex items-center gap-1 text-xs text-muted-foreground">
                  <User className="size-3" />
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <span className="max-w-24 truncate">{task.Assignee}</span>
                    </TooltipTrigger>
                    <TooltipContent>{task.Assignee}</TooltipContent>
                  </Tooltip>
                </span>
              ) : (
                <span className="flex items-center gap-1 text-xs text-muted-foreground/50">
                  <User className="size-3" />
                  <span>—</span>
                </span>
              )}
            </span>

            {/* Date */}
            <span className="shrink-0">
              <TaskPlannedDates
                start={task.TimePlannedStart}
                end={task.TimePlannedEnd}
                hasStartTime={task.HasTimePlannedStart}
                hasEndTime={task.HasTimePlannedEnd}
                excludeYear
                overdue={!!overdue}
              />
            </span>
          </div>
        </TaskEditorDrawer>
      </TaskProvider>
    </ProjectProvider>
  );
}

export function UpcomingTaskRow(props: Props) {
  return <UpcomingTaskRowInner {...props} />;
}
