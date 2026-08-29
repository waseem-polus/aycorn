import { useContext, useEffect, useRef, useState } from "react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ChevronDown,
  ClipboardIcon,
  CopyCheckIcon,
  EllipsisIcon,
  LandPlotIcon,
  PinIcon,
  Trash2Icon,
  User,
} from "lucide-react";
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
import RelativePlannedDateBadge from "@/features/task/properties/relative-planned-date-badge";
import { DatePickerInput } from "@/components/DatePickerInput";
import { RichEditor } from "@/features/editor/rich-editor";
import { useProjectDetailsQuery } from "@/queries/useProjectDetailsQuery";
import { useTaskMutation } from "@/queries/useTaskMutation";
import { defaultProjectContextValue } from "@/contexts/project/ProjectContext";
import type { Task } from "@/types/types";
import type { Value } from "platejs";
import type { PlateEditor } from "platejs/react";
import { serializeMd } from "@platejs/markdown";
import { toast } from "sonner";
import { extractPlainText } from "@/features/task/task-utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import TaskPriorityIcon from "../properties/icons/TaskPriorityIcon";
import TaskTypeBadge from "../properties/task-type-badge";
import { WorkflowStageChip } from "@/features/workflows/shared/workflow-stage-chip";
import { Separator } from "@/components/ui/separator";
import { TaskRelationshipsCard } from "@/features/task/relationships/task-relationships-card";
import { TaskRelationshipBadges } from "@/features/task/relationships/task-relationship-badges";

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
  const { update, updateBody, deleteTask } = useTaskMutation(projectId);
  const [propertiesOpen, setPropertiesOpen] = useState(true);
  const editorRef = useRef<PlateEditor | null>(null);
  const [editorReady, setEditorReady] = useState(false);

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
    setTask({ ...task, Body: value });
    if (task.ID !== 0) {
      updateBody.mutate({ taskId: task.ID, body: value });
    }
  };

  const handleCopyAsMarkdown = () => {
    if (!editorRef.current) return;
    try {
      const bodyMd = serializeMd(editorRef.current);
      const content = task.Name ? `# ${task.Name}\n\n${bodyMd}` : bodyMd;
      navigator.clipboard.writeText(content);
      toast("Copied as markdown");
    } catch {
      toast.error("Failed to copy as markdown");
    }
  };

  const handleCopyAsPlainText = () => {
    const bodyText = extractPlainText(task.Body);
    const content = task.Name ? `${task.Name}\n\n${bodyText}` : bodyText;
    navigator.clipboard.writeText(content);
    toast("Copied as plain text");
  };

  const stage = Stages.find((s) => s.ID === task.Stage);

  const handleDelete = () => {
    const taskName = task.Name === "" ? "Untitled Task" : task.Name;
    deleteTask.mutate(task.ID, {
      onSuccess: () => {
        toast(`Deleted '${taskName}'`);
        window.history.back();
      },
      onError: () => toast.error(`Failed deleting '${taskName}'`),
    });
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
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                size="icon"
                variant="ghost"
                className="shrink-0 self-start data-[state=open]:bg-muted text-muted-foreground"
              >
                <EllipsisIcon className="size-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuGroup>
                <DropdownMenuItem>
                  <PinIcon className="text-muted-foreground" />
                  Pin
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <CopyCheckIcon className="text-muted-foreground" />
                  Duplicate
                </DropdownMenuItem>
                <DropdownMenuSub>
                  <DropdownMenuSubTrigger>
                    <ClipboardIcon className="text-muted-foreground" />
                    Copy as
                  </DropdownMenuSubTrigger>
                  <DropdownMenuSubContent>
                    <DropdownMenuItem
                      disabled={!editorReady}
                      onClick={handleCopyAsMarkdown}
                    >
                      Markdown
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleCopyAsPlainText}>
                      Plain text
                    </DropdownMenuItem>
                  </DropdownMenuSubContent>
                </DropdownMenuSub>
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuGroup>
                <DropdownMenuItem onClick={handleDelete} variant="destructive">
                  <Trash2Icon className="text-muted-foreground" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {!propertiesOpen && (
          <div className="flex flex-wrap items-center gap-1.5 pb-2">
            <TaskTypeBadge type={task.Type} />
            {stage && (
              <WorkflowStageChip className="rounded-full" stage={stage} />
            )}
            <Badge variant="secondary">
              <LandPlotIcon className="size-2" />
              {task.ChecklistName}
            </Badge>
            <Badge
              variant={task.Assignee !== "" ? "secondary" : "outline"}
              className={task.Assignee !== "" ? "" : "text-muted-foreground"}
            >
              <User className="size-2" />
              {task.Assignee !== "" ? task.Assignee : "—"}
            </Badge>
            <RelativePlannedDateBadge
              start={task.TimePlannedStart}
              end={task.TimePlannedEnd}
              overdue={
                task.TimePlannedStart !== null &&
                new Date(task.TimePlannedEnd ?? task.TimePlannedStart) <
                  new Date() &&
                stage?.Type !== "done"
              }
            />
            <Separator orientation="vertical" className="h-4! sm:mx-2" />
            <TaskRelationshipBadges taskId={task.ID} />
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

            <Separator orientation="horizontal" className="my-2" />

            <TaskRelationshipsCard />
          </section>
        </CollapsibleContent>
      </Collapsible>

      <RichEditor
        key={task.ID}
        onDebounceChange={handleEditorValueChange}
        onEditorReady={(editor) => {
          editorRef.current = editor;
          setEditorReady(true);
        }}
        debounceDuration={250}
        initialValue={task.Body && task.Body.length > 0 ? task.Body : []}
        className="px-2"
      />
    </div>
  );
}
