import { useRef, useState, type CSSProperties } from "react";
import { useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { ArchiveIcon, PinIcon } from "lucide-react";
import { EditableHeader } from "@/components/EditableHeader";
import { RelativeTimeWithTooltip } from "@/components/relative-time-with-tooltip";
import {
  Card,
  CardAction,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useFocusAndSelect } from "@/hooks/useFocusAndSelect";
import { selectedItemClasses } from "@/hooks/useSelection";
import { useProjectMutation } from "@/queries/useProjectMutation";
import { useAllProjectsMutation } from "@/queries/useAllProjectsMutation";
import { ProjectCardMenu } from "@/features/projects/project-card-menu";
import { DeleteProjectDialog } from "@/features/projects/delete-project-dialog";
import { stageStrokeClass } from "@/features/stage/stage-palette";
import { cn } from "@/lib/utils";
import type { Project, ProjectFolder } from "@/types/types";

type Props = {
  project: Project;
  folders: ProjectFolder[];
  dragRef?: (node: HTMLElement | null) => void;
  dragStyle?: CSSProperties;
  dragAttributes?: Record<string, unknown>;
  itemProps?: Record<string, unknown>;
  children?: React.ReactNode;
};

export function ProjectCard({
  project,
  folders,
  dragRef,
  dragStyle,
  dragAttributes,
  itemProps,
  children,
}: Props) {
  const navigate = useNavigate();
  const { updateProject, setPinned, setArchived } = useProjectMutation(
    project.ID,
  );
  const { bulkSetFolder, duplicateProjectConfig } = useAllProjectsMutation();
  const [isEditing, setIsEditing] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const editableRef = useRef<HTMLHeadingElement>(null);

  useFocusAndSelect(editableRef, isEditing);

  const itemOnClick = (itemProps as { onClick?: (e: React.MouseEvent) => void })
    ?.onClick;
  const itemClassName = (itemProps?.className as string | undefined) ?? "";

  const displayName = project.Name !== "" ? project.Name : "New Project";

  const handleSaveName = (newName: string) => {
    setIsEditing(false);
    if (newName !== project.Name) {
      updateProject.mutate(
        { ...project, Name: newName },
        { onError: () => toast.error("Failed to rename project.") },
      );
    }
  };

  const handleTogglePin = () =>
    setPinned.mutate(!project.Pinned, {
      onError: () => toast.error("Failed to update pin."),
    });

  const handleToggleArchive = () =>
    setArchived.mutate(!project.Archived, {
      onSuccess: () =>
        toast(
          project.Archived
            ? `Restored "${displayName}".`
            : `Archived "${displayName}".`,
        ),
      onError: () => toast.error("Failed to update project."),
    });

  const handleMoveToFolder = (folderId: number) =>
    bulkSetFolder.mutate(
      { ids: [project.ID], folder: folderId },
      { onError: () => toast.error("Failed to move project.") },
    );

  const handleDuplicate = () =>
    duplicateProjectConfig.mutate(project.ID, {
      onSuccess: () => toast(`Duplicated "${displayName}".`),
      onError: () => toast.error("Failed to duplicate project."),
    });

  return (
    <>
      <Card
        ref={dragRef}
        style={dragStyle}
        {...dragAttributes}
        {...itemProps}
        data-task-card=""
        className={cn(
          "relative gap-3 rounded-lg py-4 shadow-none hover:bg-accent/30 cursor-pointer",
          selectedItemClasses(),
          itemClassName,
        )}
        onClick={(e) => {
          itemOnClick?.(e);
          if (e.defaultPrevented) return;
          if (!isEditing) {
            navigate({
              to: "/project/$projectId",
              params: { projectId: String(project.ID) },
            });
          }
        }}
      >
        <CardHeader className="relative gap-0.5 px-4 pointer-events-none">
          <CardTitle className="font-medium min-w-0">
            {isEditing ? (
              <div
                className="pointer-events-auto"
                onClick={(e) => e.stopPropagation()}
                onKeyDown={(e) => e.stopPropagation()}
              >
                <EditableHeader
                  ref={editableRef}
                  value={project.Name}
                  setValue={handleSaveName}
                  onBlur={() => setIsEditing(false)}
                  placeholder="New Project"
                  className="text-base font-medium p-0 min-h-0 cursor-text"
                />
              </div>
            ) : (
              <div className="flex items-center gap-1.5 min-w-0">
                {project.Pinned && (
                  <PinIcon
                    className={cn(stageStrokeClass("red"), "size-4 shrink-0")}
                  />
                )}
                {project.Archived && (
                  <ArchiveIcon className="size-4 shrink-0 text-muted-foreground" />
                )}
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span
                      className={cn(
                        "text-base truncate",
                        project.Name === "" && "text-muted-foreground",
                      )}
                    >
                      {displayName}
                    </span>
                  </TooltipTrigger>
                  <TooltipContent>{displayName}</TooltipContent>
                </Tooltip>
              </div>
            )}
          </CardTitle>

          <CardDescription className="text-xs truncate">
            {project.WorkflowName}
          </CardDescription>
          <RelativeTimeWithTooltip
            date={project.TimeModified}
            label="Updated"
            className="text-xs"
          />

          <CardAction className="pointer-events-auto flex items-center gap-0.5">
            {children}
            <ProjectCardMenu
              project={project}
              folders={folders}
              onRename={() => setTimeout(() => setIsEditing(true), 100)}
              onTogglePin={handleTogglePin}
              onToggleArchive={handleToggleArchive}
              onDuplicate={handleDuplicate}
              onMoveToFolder={handleMoveToFolder}
              onSettings={() =>
                navigate({
                  to: "/project/settings/$projectId",
                  params: { projectId: String(project.ID) },
                  search: { tab: "workflow" },
                })
              }
              onWorkflow={() =>
                navigate({
                  to: "/workflow/$workflowId",
                  params: { workflowId: String(project.Workflow) },
                })
              }
              onDelete={() => setDeleteOpen(true)}
            />
          </CardAction>
        </CardHeader>
      </Card>

      <DeleteProjectDialog
        project={project}
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
      />
    </>
  );
}
