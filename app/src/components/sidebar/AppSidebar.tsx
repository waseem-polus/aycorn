import React from "react";
import { NavPinnedProjects } from "@/components/sidebar/NavPinnedProjects";
import { NavMain } from "@/components/sidebar/NavMain";
import { NavSecondary } from "@/components/sidebar/NavSecondary";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import {
  CalendarClockIcon,
  ChartAreaIcon,
  FolderIcon,
  LinkIcon,
  SettingsIcon,
  Squirrel,
  TagsIcon,
  WorkflowIcon,
} from "lucide-react";
import { Badge } from "../ui/badge";

const data = {
  navMain: [
    {
      title: "Projects",
      url: "/",
      icon: FolderIcon,
    },
    {
      title: "Upcoming",
      url: "/upcoming",
      icon: CalendarClockIcon,
    },
  ],
  navConfigure: [
    {
      title: "Workflows",
      url: "/workflows",
      icon: WorkflowIcon,
    },
    {
      title: "Task Types",
      url: "/task-types",
      icon: TagsIcon,
    },
    {
      title: "Task Links",
      url: "/relationship-types",
      icon: LinkIcon,
      badge: <Badge className="text-xs py-0.5 -rotate-2">New!</Badge>,
    },
  ],
  navSecondary: [
    {
      title: "Usage",
      url: "/usage",
      icon: ChartAreaIcon,
    },
    {
      title: "Settings",
      url: "/settings",
      icon: SettingsIcon,
    },
  ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:p-1.5!"
            >
              <a href="/">
                <Squirrel className="size-5!" />
                <span className="text-base font-semibold">Aycorn Corp.</span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        <NavMain items={data.navConfigure} label="Configuration" />
        <NavPinnedProjects />
        <NavSecondary items={data.navSecondary} className="mt-auto" />
      </SidebarContent>
    </Sidebar>
  );
}
