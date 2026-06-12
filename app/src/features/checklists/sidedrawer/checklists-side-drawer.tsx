import { Empty, EmptyDescription } from "@/components/ui/empty";
import React, { useContext, useMemo } from "react";
import { LandPlot } from "lucide-react";
import { ProjectContext } from "@/contexts/project/ProjectContext";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { useState } from "react";
import { useIsMobile } from "@/hooks/useMobile";
import {
  ChecklistFilters,
  type ChecklistStatusFilter,
} from "@/features/checklists/checklist-filters";
import { ChecklistCard } from "@/features/checklists/checklist-card";

export default function ChecklistsSideDrawer({
  children,
  onOpenChange = () => {},
}: {
  children: React.ReactNode;
  onOpenChange?: (open: boolean) => void;
}) {
  const { Checklists } = useContext(ProjectContext);

  const isMobile = useIsMobile();
  const [open, setOpen] = useState(false);
  const [newlyCreatedId, setNewlyCreatedId] = useState<number | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<ChecklistStatusFilter>("all");

  const filteredChecklists = useMemo(
    () =>
      Checklists.filter((c) => {
        if (search && !c.Name.toLowerCase().includes(search.toLowerCase()))
          return false;
        if (statusFilter !== "all" && c.Status !== statusFilter) return false;
        return true;
      }),
    [Checklists, search, statusFilter],
  );

  return (
    <Drawer
      handleOnly={!isMobile}
      direction={isMobile ? "bottom" : "right"}
      open={open}
      onOpenChange={(open) => {
        setOpen(open);
        onOpenChange(open);
      }}
    >
      <DrawerTrigger asChild>{children}</DrawerTrigger>
      <DrawerContent className="h-full min-w-1/3">
        <DrawerHeader>
          <DrawerTitle className="flex gap-1">
            <LandPlot className="size-5" />
            Checklists
          </DrawerTitle>
          <DrawerDescription>
            View and update this project's checklists
          </DrawerDescription>
        </DrawerHeader>
        <div className="p-4 pt-1 flex flex-col gap-2 flex-1 min-h-0">
          <ChecklistFilters
            search={search}
            onSearchChange={setSearch}
            statusFilter={statusFilter}
            onStatusFilterChange={setStatusFilter}
            count={filteredChecklists.length}
            onCreated={setNewlyCreatedId}
          />
          <div className="flex flex-col gap-2 flex-1 overflow-auto min-h-0">
            {filteredChecklists.length > 0 ? (
              filteredChecklists.map((checklist) => (
                <ChecklistCard
                  key={checklist.ID}
                  checklist={checklist}
                  autoFocus={checklist.ID === newlyCreatedId}
                  onFocusConsumed={() => setNewlyCreatedId(null)}
                />
              ))
            ) : (
              <Empty>
                <EmptyDescription>No Checklists Found</EmptyDescription>
              </Empty>
            )}
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
