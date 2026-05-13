import { LandPlot } from "lucide-react";
import { Button } from "@/components/ui/button";
import ChecklistSideDrawer from "@/components/checklists/sidedrawer/ChecklistsSideTable";

export function ProjectChecklists() {
  return (
    <ChecklistSideDrawer>
      <Button variant="outline">
        <LandPlot />
        Checklists
      </Button>
    </ChecklistSideDrawer>
  );
}
