import { useContext, useState, type RefObject } from "react";
import { flushSync } from "react-dom";
import { useLocation, useNavigate } from "@tanstack/react-router";
import {
  CalendarIcon,
  FolderOpenIcon,
  LandPlotIcon,
  Layers2Icon,
  LinkIcon,
  Maximize2Icon,
  PanelTopCloseIcon,
  PanelTopOpenIcon,
  PilcrowIcon,
  ShapesIcon,
  SignalIcon,
  TextCursorInputIcon,
  UserIcon,
  WorkflowIcon,
} from "lucide-react";
import { DynamicIcon, type IconName } from "lucide-react/dynamic";
import type { PlateEditor } from "platejs/react";
import { ProjectContext } from "@/contexts/project/ProjectContext";
import { TaskContext } from "@/contexts/task/TaskContext";
import type {
  CommandScope,
  PaletteCommand,
} from "@/features/command-palette/command-types";
import { useRegisterCommands } from "@/features/command-palette/hooks/useRegisterCommands";
import { StageIcon } from "@/features/stage/stage-visual";
import { stageStrokeClass } from "@/features/stage/stage-palette";
import { useTaskTypeCategoriesQuery } from "@/features/task-types/queries/useTaskTypeCategoriesQuery";
import { useTaskTypesQuery } from "@/features/task-types/queries/useTaskTypesQuery";
import type { EditableTaskNameHandle } from "@/features/task/header/editable-task-name";
import TaskPriorityIcon from "@/features/task/properties/icons/TaskPriorityIcon";
import { useTaskRelationshipTypesQuery } from "@/features/task/relationships/queries/useTaskRelationshipTypesQuery";
import type { NewLinkRequest } from "@/features/task/relationships/task-relationships-drawer";
import { toTaskType } from "@/features/task/shared/shared-task-type";
import { cn } from "@/lib/utils";
import {
  PRIORITIES,
  RELATIONSHIP_BEHAVIORS,
  type ChecklistTask,
  type RelationshipBehavior,
  type Task,
} from "@/types/types";

type Options = {
  /** Persists an edited task, the same callback the property controls get. */
  onChange: (task: Task) => void;
  nameRef: RefObject<EditableTaskNameHandle | null>;
  editorRef: RefObject<PlateEditor | null>;
  /** The properties section, used to reach the assignee and date controls. */
  propertiesRef: RefObject<HTMLElement | null>;
  propertiesOpen: boolean;
  setPropertiesOpen: (open: boolean) => void;
  /** Only the drawer has a full page to open. */
  onOpenFullPage?: () => void;
  scope?: CommandScope;
  enabled?: boolean;
};

const CURRENT = "Current";

// Ordered like the link picker's groups.
const linkGroups: Record<RelationshipBehavior, string> = {
  blocking: "Blocking",
  subtask: "Subtask",
  link: "Link",
};

/**
 * Command palette commands for editing the open task, shared by the task page
 * and the task drawer. The overflow menu's actions (duplicate, move, copy,
 * delete) are registered by TaskActionsMenu, which owns their dialogs.
 *
 * Returns the pending "Add task link" request for TaskRelationshipsCard.
 */
export const useTaskEditorCommands = ({
  onChange,
  nameRef,
  editorRef,
  propertiesRef,
  propertiesOpen,
  setPropertiesOpen,
  onOpenFullPage,
  scope,
  enabled = true,
}: Options) => {
  const navigate = useNavigate();
  const pathname = useLocation({ select: (location) => location.pathname });
  const { state: task, setState: setTask } = useContext(TaskContext);
  const { Project, Workflow, Stages, Checklists } = useContext(ProjectContext);
  const { data: types = [] } = useTaskTypesQuery();
  const { data: categories = [] } = useTaskTypeCategoriesQuery();
  const { data: linkTypes = [] } = useTaskRelationshipTypesQuery();
  const [linkRequest, setLinkRequest] = useState<NewLinkRequest | null>(null);

  const change = (changes: Partial<ChecklistTask>) => {
    const updated = { ...task, ...changes };
    setTask(updated);
    onChange(updated);
  };

  // The properties section unmounts its contents when collapsed, so open it
  // (synchronously) before reaching for a control inside it.
  const revealProperty = (id: string) => {
    if (!propertiesOpen) flushSync(() => setPropertiesOpen(true));
    return propertiesRef.current?.querySelector<HTMLElement>(`#${id}`) ?? null;
  };

  const focusAssignee = () => {
    const input = revealProperty("assignee");
    if (!(input instanceof HTMLInputElement)) return;
    input.focus();
    input.select();
  };

  const requestLink = (link: NewLinkRequest) => {
    if (!propertiesOpen) flushSync(() => setPropertiesOpen(true));
    // A new object each time: the card treats each one as a new request.
    setLinkRequest({ ...link });
  };

  const workflowId = Workflow.ID || Project.Workflow;
  const workflowName = Workflow.Name || Project.WorkflowName;
  const projectPath = `/project/${Project.ID}`;

  // Same headings as the type picker, including its "Uncategorized" group.
  const categoryName = (id: number) => {
    const category = categories.find((c) => c.ID === id);
    return category ? category.Name || "Untitled Category" : "Uncategorized";
  };

  const commands: PaletteCommand[] = [
    {
      id: "task.rename",
      title: "Rename task",
      group: "Task",
      icon: TextCursorInputIcon,
      keywords: ["name", "title"],
      run: () => nameRef.current?.focus(),
    },
    {
      id: "task.body.edit",
      title: "Edit task body",
      group: "Task",
      icon: PilcrowIcon,
      keywords: ["description", "content", "editor", "write"],
      run: () => editorRef.current?.tf.focus({ edge: "endEditor" }),
    },
    {
      id: "task.properties.toggle",
      title: propertiesOpen ? "Hide task properties" : "Show task properties",
      group: "Task",
      icon: propertiesOpen ? PanelTopCloseIcon : PanelTopOpenIcon,
      keywords: ["collapse", "expand", "details"],
      run: () => setPropertiesOpen(!propertiesOpen),
    },
    {
      id: "task.priority.set",
      title: "Change task priority",
      group: "Task",
      icon: SignalIcon,
      hint: task.Priority,
      placeholder: "Choose a priority…",
      items: PRIORITIES.map((priority) => ({
        id: `task.priority.set.${priority}`,
        title: priority,
        group: "Priorities",
        icon: <TaskPriorityIcon variant={priority} />,
        hint: priority === task.Priority ? CURRENT : undefined,
        run: () => change({ Priority: priority }),
      })),
    },
    {
      id: "task.type.set",
      title: "Change task type",
      group: "Task",
      icon: ShapesIcon,
      hint: task.Type?.Name || undefined,
      placeholder: "Choose a type…",
      items: types.map((type) => ({
        id: `task.type.set.${type.ID}`,
        title: type.Name,
        group: categoryName(type.Category),
        icon: (
          <DynamicIcon
            name={type.Icon as IconName}
            className={cn("size-4 shrink-0", stageStrokeClass(type.Color))}
            fallback={() => <span className="size-4 shrink-0" />}
          />
        ),
        hint: type.ID === task.Type?.ID ? CURRENT : undefined,
        run: () => change({ Type: toTaskType(type) }),
      })),
    },
    ...(Stages.length
      ? [
          {
            id: "task.stage.set",
            title: "Change task stage",
            group: "Task",
            icon: Layers2Icon,
            keywords: ["status", "move"],
            hint: Stages.find((stage) => stage.ID === task.Stage)?.Name,
            placeholder: "Choose a stage…",
            items: Stages.map((stage) => ({
              id: `task.stage.set.${stage.ID}`,
              title: stage.Name || "Untitled stage",
              group: "Stages",
              icon: <StageIcon stage={stage} />,
              hint: stage.ID === task.Stage ? CURRENT : undefined,
              run: () => change({ Stage: stage.ID }),
            })),
          },
        ]
      : []),
    ...(Checklists.length
      ? [
          {
            id: "task.checklist.set",
            title: "Change task checklist",
            group: "Task",
            icon: LandPlotIcon,
            hint: task.ChecklistName || undefined,
            placeholder: "Choose a checklist…",
            items: Checklists.map((checklist) => ({
              id: `task.checklist.set.${checklist.ID}`,
              title: checklist.Name || "Untitled Checklist",
              group: "Checklists",
              icon: LandPlotIcon,
              hint: checklist.ID === task.Checklist ? CURRENT : undefined,
              run: () =>
                change({
                  Checklist: checklist.ID,
                  ChecklistName: checklist.Name,
                }),
            })),
          },
        ]
      : []),
    {
      id: "task.assignee.set",
      title: "Change task assignee",
      group: "Task",
      icon: UserIcon,
      keywords: ["assign", "owner"],
      hint: task.Assignee || undefined,
      run: focusAssignee,
    },
    {
      id: "task.date.set",
      title: "Change task date",
      group: "Task",
      icon: CalendarIcon,
      keywords: ["planned", "schedule", "due", "start", "end"],
      run: () => revealProperty("date")?.click(),
    },
    {
      id: "task.link.add",
      title: "Add task link",
      group: "Task",
      icon: LinkIcon,
      keywords: ["relationship", "blocks", "subtask", "relate"],
      placeholder: "Choose a link…",
      items: RELATIONSHIP_BEHAVIORS.flatMap((behavior) =>
        linkTypes.filter((type) => type.Behavior === behavior),
      ).flatMap((type) =>
        (["from", "to"] as const).map((direction) => ({
          id: `task.link.add.${type.ID}.${direction}`,
          title: direction === "from" ? type.FromName : type.ToName,
          group: linkGroups[type.Behavior as RelationshipBehavior],
          icon: (
            <DynamicIcon
              name={type.Icon as IconName}
              className={cn("size-4 shrink-0", stageStrokeClass(type.Color))}
              fallback={() => <LinkIcon className="size-4 shrink-0" />}
            />
          ),
          run: () => requestLink({ typeId: type.ID, direction }),
        })),
      ),
    },
    ...(onOpenFullPage
      ? [
          {
            id: "task.page.open",
            title: "Open task in full page",
            group: "Task",
            icon: Maximize2Icon,
            keywords: ["expand", "maximize"],
            run: onOpenFullPage,
          },
        ]
      : []),
    // Already there when the drawer is open on the project's own page.
    ...(Project.ID && pathname !== projectPath
      ? [
          {
            id: "task.project.open",
            title: "Go to task's project",
            group: "Task",
            icon: FolderOpenIcon,
            keywords: ["navigate"],
            hint: Project.Name || undefined,
            run: () =>
              navigate({
                to: "/project/$projectId",
                params: { projectId: String(Project.ID) },
              }),
          },
        ]
      : []),
    ...(workflowId
      ? [
          {
            id: "task.workflow.open",
            title: "Go to task's workflow",
            group: "Task",
            icon: WorkflowIcon,
            keywords: ["navigate", "stages"],
            hint: workflowName || undefined,
            run: () =>
              navigate({
                to: "/workflow/$workflowId",
                params: { workflowId: String(workflowId) },
              }),
          },
        ]
      : []),
  ];

  useRegisterCommands(commands, { scope, enabled });

  return { linkRequest };
};
