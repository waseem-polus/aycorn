import { Empty, EmptyDescription } from "@/components/ui/empty";
import { ItemGroup, ItemSeparator } from "@/components/ui/item";
import React, { useContext } from "react";
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
import { ChecklistFilters } from "../ChecklistFilters";
import { ChecklistSideTableItem } from "./ChecklistSideTableItem";

export default function TaskSideDrawer({
  children,
  onOpenChange = () => {},
}: {
  children: React.ReactNode;
  onOpenChange?: (open: boolean) => void;
}) {
  const { Checklists } = useContext(ProjectContext);

  const isMobile = useIsMobile();
  const [open, setOpen] = useState(false);

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
      <DrawerContent className="h-full">
        <DrawerHeader>
          <DrawerTitle className="flex gap-1">
            <LandPlot className="size-5" />
            Checklists
          </DrawerTitle>
          <DrawerDescription>
            View and update this project's checklists
          </DrawerDescription>
        </DrawerHeader>
        <div className="p-4 pt-1 flex flex-col gap-2">
          <ChecklistFilters />
          <ItemGroup className="h-full rounded-md border overflow-auto">
            {Checklists.length > 0 ? (
              Checklists.map((checklist, i) => (
                <React.Fragment key={checklist.ID}>
                  <ChecklistSideTableItem checklist={checklist} />
                  {Checklists.length - 1 != i && <ItemSeparator />}
                </React.Fragment>
              ))
            ) : (
              <Empty>
                <EmptyDescription>No Checklists Found</EmptyDescription>
              </Empty>
            )}
          </ItemGroup>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
