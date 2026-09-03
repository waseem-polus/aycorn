import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Link, useNavigate } from "@tanstack/react-router";
import {
  EllipsisIcon,
  Fullscreen,
  GripVertical,
  Link2,
  PinOffIcon,
  Trash2Icon,
} from "lucide-react";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { ProjectIcon } from "@/features/projects/project-icon";
import { useProjectMutation } from "@/queries/useProjectMutation";
import { cn } from "@/lib/utils";
import type { Project } from "@/types/types";

type Props = {
  project: Project;
  isReordering: boolean;
  onDelete: (project: Project) => void;
};

export function PinnedProjectItem({ project, isReordering, onDelete }: Props) {
  const { isMobile } = useSidebar();
  const navigate = useNavigate();
  const { setPinned } = useProjectMutation(project.ID);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: project.ID });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const displayName = project.Name !== "" ? project.Name : "New Project";
  const projectPath = `/project/${project.ID}`;

  const handleUnpin = () =>
    setPinned.mutate(false, {
      onError: () => toast.error("Failed to unpin project."),
    });

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(
        `${window.location.origin}${projectPath}`,
      );
      toast("Link copied.");
    } catch {
      toast.error("Failed to copy link.");
    }
  };

  // In reorder mode the row is a drag target, not a link — navigating mid-drag
  // would throw the user out of the sidebar.
  if (isReordering) {
    return (
      <SidebarMenuItem
        ref={setNodeRef}
        style={style}
        data-task-card=""
        className={cn(isDragging && "opacity-50")}
      >
        <SidebarMenuButton
          asChild
          size={isMobile ? "lg" : "default"}
          className="cursor-grab active:cursor-grabbing"
        >
          <div
            data-drag-handle=""
            style={{ touchAction: "none" }}
            {...attributes}
            {...listeners}
          >
            <GripVertical className="size-4 shrink-0 text-muted-foreground" />
            <span className="truncate">{displayName}</span>
          </div>
        </SidebarMenuButton>
      </SidebarMenuItem>
    );
  }

  return (
    <SidebarMenuItem>
      <SidebarMenuButton asChild size={isMobile ? "lg" : "default"}>
        <Link to="/project/$projectId" params={{ projectId: String(project.ID) }}>
          <ProjectIcon project={project} />
          <span className="truncate">{displayName}</span>
        </Link>
      </SidebarMenuButton>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <SidebarMenuAction
            showOnHover
            className="data-[state=open]:bg-accent rounded-sm"
          >
            <EllipsisIcon />
            <span className="sr-only">More</span>
          </SidebarMenuAction>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          className="rounded-lg"
          side={isMobile ? "bottom" : "right"}
          align={isMobile ? "end" : "start"}
        >
          <DropdownMenuItem onClick={handleUnpin}>
            <PinOffIcon />
            <span>Remove Pin</span>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={() =>
              navigate({
                to: "/project/$projectId",
                params: { projectId: String(project.ID) },
              })
            }
          >
            <Fullscreen />
            <span>Open</span>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleCopyLink}>
            <Link2 />
            <span>Copy link</span>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            variant="destructive"
            onClick={() => onDelete(project)}
          >
            <Trash2Icon />
            <span>Delete</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </SidebarMenuItem>
  );
}
