import * as React from "react";
import {
    IconCalendar,
    IconDashboard,
    IconFolder,
    IconHelp,
    IconLayoutBoard,
    IconSearch,
    IconSettings,
    IconStack2,
} from "@tabler/icons-react";

import { NavPinnedProjects } from "@/components/nav-documents";
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
            url: "#",
            icon: IconDashboard,
        },
        {
            title: "Khanban",
            url: "#",
            icon: IconLayoutBoard,
        },
        {
            title: "Upcoming",
            url: "#",
            icon: IconCalendar,
        },
        {
            title: "Projects",
            url: "#",
            icon: IconFolder,
        },
        {
            title: "Quick Tasks",
            url: "#",
            icon: IconStack2,
        },
    ],
    navSecondary: [
        {
            title: "Settings",
            url: "#",
            icon: IconSettings,
        },
        {
            title: "Get Help",
            url: "#",
            icon: IconHelp,
        },
        {
            title: "Search",
            url: "#",
            icon: IconSearch,
        },
    ],
    pinnedProjects: [
        {
            name: "CRM Sales Platform",
            url: "#",
        },
        {
            name: "Fitness Tracker Wearable App",
            url: "#",
        },
        {
            name: "Mobile Banking App",
            url: "#",
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
                            <a href="#">
                                <Squirrel className="!size-5" />
                                <span className="text-base font-semibold">
                                    Aycorn Corp.
                                </span>
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
