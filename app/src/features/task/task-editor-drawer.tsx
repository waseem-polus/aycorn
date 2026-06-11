import { Drawer, DrawerContent, DrawerTrigger } from "@/components/ui/drawer";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { SelectTaskStage } from "@/features/stage/select-task-stage";
import { SelectTaskType } from "@/features/task/properties/select-task-type";
import { SelectTaskPriority } from "@/features/task/properties/select-task-priority";
import { DatePickerInput } from "@/components/DatePickerInput";
import { useContext, useRef, useState } from "react";
import { TaskContext } from "@/contexts/task/TaskContext";
import { EditableTaskName } from "@/features/task/header/editable-task-name";
import { SelectChecklist } from "@/features/task/properties/select-checklist";
import { useTaskMutation } from "@/queries/useTaskMutation";
import { ProjectContext } from "@/contexts/project/ProjectContext";
import type { Task } from "@/types/types";
import { useIsMobile } from "@/hooks/useMobile";
import { RichEditor } from "@/features/editor/rich-editor";
import { TaskEditorHeader } from "@/features/task/header/task-editor-header";
import { TaskProperty } from "@/features/task/properties/task-property";
import { TaskAssignee } from "@/features/task/properties/task-assignee";
import type { Value } from "platejs";
import type { PlateEditor } from "platejs/react";
import { serializeMd } from "@platejs/markdown";
import { toast } from "sonner";
import { useTaskBodyQuery } from "@/queries/useTaskQuery";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChevronDown, LandPlotIcon, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { TaskPlannedDates } from "@/features/task/properties/task-planned-dates";
import { extractPlainText } from "@/features/task/task-utils";

export default function TaskEditorDrawer({
  children,
  onOpenChange = () => {},
}: {
  children: React.ReactNode;
  onOpenChange?: (open: boolean) => void;
}) {
  const isMobile = useIsMobile();
  const [open, setOpen] = useState(false);
  const [propertiesOpen, setPropertiesOpen] = useState(true);
  const editorRef = useRef<PlateEditor | null>(null);
  const [editorReady, setEditorReady] = useState(false);

  const { state: task, setState: setTask } = useContext(TaskContext);
  const { Project } = useContext(ProjectContext);
  const { update } = useTaskMutation(Project.ID);

  const handleTaskChanges = (updatedTask: Task) => {
    update.mutate(updatedTask);
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

  const { isPending, isFetching, data } = useTaskBodyQuery(task.ID, open);
  const handleEditorValueChange = (value: Value) => {
    setTask({ ...task, Body: value });
    handleTaskChanges({ ...task, Body: value });
  };

  return (
    <Drawer
      handleOnly={!isMobile}
      repositionInputs={!isMobile}
      direction={isMobile ? "bottom" : "right"}
      open={open}
      onOpenChange={(open) => {
        setOpen(open);
        onOpenChange(open);
        setPropertiesOpen(!isMobile || task.ID === 0);
        if (!open) {
          editorRef.current = null;
          setEditorReady(false);
        }
      }}
    >
      <DrawerTrigger asChild>{children}</DrawerTrigger>
      <DrawerContent className="min-w-1/2 p-0 overflow-x-visible box-border rounded-lg data-[vaul-drawer-direction=bottom]:h-[calc(100dvh-var(--header-height))] data-[vaul-drawer-direction=bottom]:max-h-dvh">
        <TaskEditorHeader
          setOpen={setOpen}
          onCopyAsMarkdown={handleCopyAsMarkdown}
          onCopyAsPlainText={handleCopyAsPlainText}
          isEditorReady={editorReady}
        />
        <div
          className="flex-1 min-h-0 overflow-y-auto"
          data-vaul-no-drag
          onWheel={(e) => e.stopPropagation()}
        >
          <Collapsible open={propertiesOpen} onOpenChange={setPropertiesOpen}>
            <div className="flex items-start gap-1 mx-3 sm:mx-6 mt-3 sm:mt-6">
              <EditableTaskName onChange={handleTaskChanges} />
              <CollapsibleTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="shrink-0 self-start"
                >
                  <ChevronDown
                    className={cn(
                      "transition-transform duration-200",
                      propertiesOpen && "rotate-180",
                    )}
                  />
                </Button>
              </CollapsibleTrigger>
            </div>
            {false && (
              <div className="flex flex-wrap items-center gap-1.5 mx-3 sm:mx-6 pb-2">
                <Badge variant="outline">
                  <LandPlotIcon className="size-2" />
                  {task.ChecklistName}
                </Badge>
                <Badge
                  variant={task.Assignee !== "" ? "secondary" : "outline"}
                  className={
                    task.Assignee !== "" ? "" : "text-muted-foreground"
                  }
                >
                  <User className="size-2" />
                  {task.Assignee !== "" ? task.Assignee : "Not Assigned"}
                </Badge>
                <TaskPlannedDates
                  start={task.TimePlannedStart}
                  end={task.TimePlannedEnd}
                  hasStartTime={task.HasTimePlannedStart}
                  hasEndTime={task.HasTimePlannedEnd}
                  excludeYear
                />
              </div>
            )}
            <CollapsibleContent className="border mx-3 sm:mx-6 pl-3 p-2 sm:p-5 rounded-lg overflow-hidden data-[state=open]:animate-collapsible-down data-[state=closed]:animate-collapsible-up mb-2">
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

          {open &&
          (task.ID === 0 ||
            (data !== undefined && !isFetching && !isPending)) ? (
            <div data-vaul-no-drag>
              <RichEditor
                key={`${task.ID}-${open}`}
                onDebounceChange={handleEditorValueChange}
                onEditorReady={(editor) => {
                  editorRef.current = editor;
                  setEditorReady(true);
                }}
                debounceDuration={250}
                initialValue={data === "" ? [] : data}
              />
            </div>
          ) : (
            <div className="flex w-full flex-col gap-2 py-4 px-8">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
            </div>
          )}
        </div>
      </DrawerContent>
    </Drawer>
  );
}
