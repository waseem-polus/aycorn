import { IconDots, IconTrash } from "@tabler/icons-react";

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
import { Fullscreen, Link2, PinOffIcon } from "lucide-react";
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
                  search={{
                    name: project.Name,
                  }}
                >
                  <span>{project.Name}</span>
                </Link>
              </SidebarMenuButton>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <SidebarMenuAction
                    showOnHover
                    className="data-[state=open]:bg-accent rounded-sm"
                  >
                    <IconDots />
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
                    <IconTrash />
                    <span>Delete</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </SidebarMenuItem>
          ))}
        <SidebarMenuItem>
          <SidebarMenuButton className="text-sidebar-foreground/70">
            <IconDots className="text-sidebar-foreground/70" />
            <span>More</span>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    </SidebarGroup>
  );
}
