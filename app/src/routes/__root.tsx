import * as React from "react";
import { Outlet, createRootRoute, useRouterState } from "@tanstack/react-router";
import { AppSidebar } from "@/components/sidebar/AppSidebar";
import { SidebarInset, SidebarProvider, useSidebar } from "@/components/ui/sidebar";

export const Route = createRootRoute({
  component: RootComponent,
});

function MobileSidebarClose() {
  const { isMobile, setOpenMobile } = useSidebar();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  React.useEffect(() => {
    if (isMobile) setOpenMobile(false);
  }, [pathname]);

  React.useEffect(() => {
    if (!isMobile) return;
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.closest("[data-sidebar]") && target.closest("a")) {
        setOpenMobile(false);
      }
    };
    document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
  }, [isMobile, setOpenMobile]);

  return null;
}

function RootComponent() {
  const sidebarCookie = document.cookie
    .split("; ")
    .find((c) => c.startsWith("sidebar_state="))
    ?.split("=")[1];
  const defaultSidebarOpen = sidebarCookie !== "false";

  return (
    <SidebarProvider
      defaultOpen={defaultSidebarOpen}
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 72)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as React.CSSProperties
      }
    >
      <MobileSidebarClose />
      <AppSidebar variant="inset" />
      <SidebarInset>
        <Outlet />
      </SidebarInset>
    </SidebarProvider>
  );
}
