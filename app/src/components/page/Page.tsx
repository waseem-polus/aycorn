import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "../ui/breadcrumb";
import React from "react";
import { Toaster } from "../ui/sonner";

export function Page({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col h-svh overflow-hidden">
      {children}
      <Toaster />
    </div>
  );
}

export function PageContent({
  children,
  fullWidth = false,
}: {
  children: React.ReactNode;
  fullWidth?: boolean;
}) {
  return (
    <div className="flex flex-1 flex-col grow overflow-hidden">
      <div className="@container/main flex flex-1 flex-col gap-2 items-center overflow-hidden">
        <div
          className={`flex flex-col gap-4 p-4 md:gap-6 w-full overflow-hidden ${fullWidth ? "" : "max-w-7xl"}`}
        >
          {children}
        </div>
      </div>
    </div>
  );
}

export function PageHeader({
  breadcrumb = [],
  children = <></>,
}: {
  breadcrumb: string[];
  children?: React.ReactNode;
}) {
  return (
    <header className="flex h-(--header-height) shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)">
      <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
        <SidebarTrigger className="-ml-1" />
        <Separator
          orientation="vertical"
          className="mx-2 data-[orientation=vertical]:h-4"
        />
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/">Home</BreadcrumbLink>
            </BreadcrumbItem>
            {breadcrumb.map((crumb: string) => (
              <React.Fragment key={crumb}>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbLink href="/">{crumb}</BreadcrumbLink>
                </BreadcrumbItem>
              </React.Fragment>
            ))}
          </BreadcrumbList>
        </Breadcrumb>
        <div className="ml-auto flex items-center gap-2">{children}</div>
      </div>
    </header>
  );
}
