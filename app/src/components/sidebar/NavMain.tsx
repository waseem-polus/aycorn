import type React from "react";
import { Link } from "@tanstack/react-router";
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { useIsMobile } from "@/hooks/useMobile";

export function NavMain({
  items,
}: {
  items: {
    title: string;
    url: string;
    icon?: React.ComponentType;
  }[];
}) {
  const isMobile = useIsMobile();

  return (
    <SidebarGroup>
      <SidebarGroupContent className="flex flex-col gap-2">
        <SidebarMenu>
          {items.map((item) => (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton
                size={isMobile ? "lg" : "default"}
                tooltip={item.title}
                asChild
              >
                <Link to={item.url} className="flex">
                  {item.icon && <item.icon />}
                  <span>{item.title}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}
