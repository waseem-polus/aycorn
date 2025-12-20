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
import { ChecklistsTable } from "./ChecklistSideTable";
import { ChecklistFilters } from "../ChecklistFilters";
import { LandPlot } from "lucide-react";

export default function TaskSideDrawer({
  children,
  onOpenChange = () => {},
}: {
  children: React.ReactNode;
  onOpenChange?: (open: boolean) => void;
}) {
  const isMobile = useIsMobile();
  const [open, setOpen] = useState(false);

  return (
    <Drawer
      direction={isMobile ? "bottom" : "right"}
      open={open}
      onOpenChange={(open) => {
        setOpen(open);
        onOpenChange(open);
      }}
    >
      <DrawerTrigger asChild>{children}</DrawerTrigger>
      <DrawerContent>
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
          <ChecklistsTable />
        </div>
      </DrawerContent>
    </Drawer>
  );
}
