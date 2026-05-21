import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import {
  Fullscreen,
  Link2,
  PinOffIcon,
  EllipsisIcon,
  Trash2Icon,
} from "lucide-react";
import { Link } from "@tanstack/react-router";
import { usePinnedProjectsQuery } from "@/queries/usePinnedProjectsQuery";
import type { Project } from "@/types/types";

export function NavPinnedProjects() {
  const { isMobile } = useSidebar();
  const { data: pinnedProjects, isFetching } = usePinnedProjectsQuery();

  return (
    <SidebarGroup className="group-data-[collapsible=icon]:hidden">
      <SidebarGroupLabel>Pinned Projects</SidebarGroupLabel>
      <SidebarMenu>
        {!isFetching &&
          pinnedProjects &&
          pinnedProjects.map((project: Project) => (
            <SidebarMenuItem key={project.Name}>
              <SidebarMenuButton asChild>
                <Link
                  to={"/project/$projectId"}
                  params={{
                    projectId: project.ID.toString(),
                  }}
                >
                  <span>
                    {project.Name !== "" ? project.Name : "New Project"}
                  </span>
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
                  <DropdownMenuItem>
                    <PinOffIcon />
                    <span>Remove Pin</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>
                    <Fullscreen />
                    <span>Open</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Link2 />
                    <span>Copy link</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem variant="destructive">
                    <Trash2Icon />
                    <span>Delete</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </SidebarMenuItem>
          ))}
        <SidebarMenuItem>
          <SidebarMenuButton className="text-sidebar-foreground/70">
            <EllipsisIcon className="text-sidebar-foreground/70" />
            <span>More</span>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    </SidebarGroup>
  );
}
