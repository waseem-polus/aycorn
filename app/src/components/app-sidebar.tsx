import React from "react";
import {
  IconCalendar,
  IconDashboard,
  IconFolder,
  IconLayoutBoard,
  IconSettings,
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
      title: "Projects",
      url: "/",
      icon: IconFolder,
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
      title: "Usage",
      url: "/usage",
      icon: IconDashboard,
    },
  ],
  navSecondary: [
    {
      title: "Settings",
      url: "/settings",
      icon: IconSettings,
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
        <NavPinnedProjects />
        <NavSecondary items={data.navSecondary} className="mt-auto" />
      </SidebarContent>
    </Sidebar>
  );
}
