import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import React from "react";
import { Toaster } from "@/components/ui/sonner";
import { MoreHorizontal } from "lucide-react";
import { SelectionContext, useSelection } from "@/hooks/useSelection";
import { useIsMobile } from "@/hooks/useMobile";
import { cn } from "@/lib/utils";
import { Link } from "@tanstack/react-router";

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
  const selection = useSelection();
  const { SelectionArea } = selection;
  const isMobile = useIsMobile();

  const inner = (
    <div
      className={cn(
        "flex flex-col gap-4 p-3 sm:p-6 md:gap-6 h-full w-full overflow-y-auto",
        fullWidth ? "" : "max-w-7xl",
      )}
    >
      {children}
    </div>
  );

  return (
    <SelectionContext.Provider value={selection}>
      <div id="wasm" className="flex flex-1 flex-col grow overflow-hidden">
        {isMobile ? (
          <div className="@container/main flex flex-1 flex-col gap-2 items-center overflow-hidden">
            {inner}
          </div>
        ) : (
          <SelectionArea className="@container/main flex flex-1 flex-col gap-2 items-center overflow-hidden">
            {inner}
          </SelectionArea>
        )}
      </div>
    </SelectionContext.Provider>
  );
}

export function PageTitle({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="flex flex-col gap-1 my-2">
      <h1 className="flex items-center gap-2 text-2xl font-semibold">
        {title}
      </h1>
      <p className="text-muted-foreground">{description}</p>
    </div>
  );
}

export type Crumb =
  | string
  | { label: string; to?: string; params?: Record<string, string> };

export function PageHeader({
  breadcrumb = [],
  children = <></>,
}: {
  breadcrumb: Crumb[];
  children?: React.ReactNode;
}) {
  const isMobile = useIsMobile();
  const collapseMiddle = isMobile && breadcrumb.length > 1;
  const collapsedCrumbs = collapseMiddle ? breadcrumb.slice(0, -1) : [];
  const visibleCrumbs = collapseMiddle
    ? [breadcrumb[breadcrumb.length - 1]]
    : breadcrumb;

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
              <BreadcrumbLink asChild>
                <Link to="/">Home</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            {collapseMiddle && (
              <>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <DropdownMenu>
                    <DropdownMenuTrigger className="flex size-9 items-center justify-center">
                      <MoreHorizontal className="size-4" />
                      <span className="sr-only">More</span>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start">
                      {collapsedCrumbs.map((crumb) => {
                        const item =
                          typeof crumb === "string" ? { label: crumb } : crumb;
                        return (
                          <DropdownMenuItem key={item.label} asChild>
                            {item.to ? (
                              <Link to={item.to as string} params={item.params}>
                                {item.label}
                              </Link>
                            ) : (
                              <span>{item.label}</span>
                            )}
                          </DropdownMenuItem>
                        );
                      })}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </BreadcrumbItem>
              </>
            )}
            {visibleCrumbs.map((crumb, index) => {
              const item = typeof crumb === "string" ? { label: crumb } : crumb;
              const isLast = index === visibleCrumbs.length - 1;
              return (
                <React.Fragment key={item.label}>
                  <BreadcrumbSeparator />
                  <BreadcrumbItem>
                    {!isLast && item.to ? (
                      <BreadcrumbLink asChild>
                        <Link to={item.to as string} params={item.params}>
                          {item.label}
                        </Link>
                      </BreadcrumbLink>
                    ) : (
                      <BreadcrumbPage>{item.label}</BreadcrumbPage>
                    )}
                  </BreadcrumbItem>
                </React.Fragment>
              );
            })}
          </BreadcrumbList>
        </Breadcrumb>
        <div className="ml-auto flex items-center gap-2">{children}</div>
      </div>
    </header>
  );
}
