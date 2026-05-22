import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { ChecklistFilter } from "@/components/project/filters/checklist-filter";
import { StageFilter } from "@/components/project/filters/stage-filter";
import { PriorityFilter } from "@/components/project/filters/priority-filter";
import { TypeFilter } from "@/components/project/filters/task-type-filter";
import { FilterIcon } from "lucide-react";
import { useIsMobile } from "@/hooks/useMobile";

export function FiltersDrawer() {
  const isMobile = useIsMobile();

  return (
    <Drawer handleOnly={!isMobile} direction={isMobile ? "bottom" : "right"}>
      <DrawerTrigger asChild>
        <Button size="icon" variant="outline">
          <FilterIcon />
        </Button>
      </DrawerTrigger>
      <DrawerContent className="h-full">
        <DrawerHeader>
          <DrawerTitle>Filters</DrawerTitle>
        </DrawerHeader>
        <div className="flex flex-wrap gap-2 p-4">
          <ChecklistFilter />
          <StageFilter />
          <PriorityFilter />
          <TypeFilter />
        </div>
      </DrawerContent>
    </Drawer>
  );
}
