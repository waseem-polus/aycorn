import * as React from "react";
import {
  IconCalendar,
  IconDashboard,
  IconFolder,
  IconLayoutBoard,
  IconSettings,
  IconStack2,
} from "@tabler/icons-react";

import { NavPinnedProjects } from "@/components/nav-pinned-projects";
import { NavMain } from "@/components/nav-main";
import { NavSecondary } from "@/components/nav-secondary";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { Squirrel } from "lucide-react";

const data = {
  navMain: [
    {
      title: "Dashboard",
      url: "/",
      icon: IconDashboard,
    },
    {
      title: "Khanban",
      url: "/khanban",
      icon: IconLayoutBoard,
    },
    {
      title: "Upcoming",
      url: "/upcoming",
      icon: IconCalendar,
    },
    {
      title: "Projects",
      url: "/projects",
      icon: IconFolder,
    },
    {
      title: "Quick Tasks",
      url: "/quickTasks",
      icon: IconStack2,
    },
  ],
  navSecondary: [
    {
      title: "Settings",
      url: "/settings",
      icon: IconSettings,
    },
  ],
  pinnedProjects: [
    {
      name: "CRM Sales Platform",
      url: "/project/123",
    },
    {
      name: "Fitness Tracker Wearable App",
      url: "/project/456",
    },
    {
      name: "Mobile Banking App",
      url: "/project/789",
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
              className="data-[slot=sidebar-menu-button]:!p-1.5"
            >
              <a href="/">
                <Squirrel className="!size-5" />
                <span className="text-base font-semibold">Aycorn Corp.</span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        <NavPinnedProjects items={data.pinnedProjects} />
        <NavSecondary items={data.navSecondary} className="mt-auto" />
      </SidebarContent>
    </Sidebar>
  );
}
