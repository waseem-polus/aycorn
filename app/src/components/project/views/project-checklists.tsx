import { LandPlot } from "lucide-react";
import { Button } from "@/components/ui/button";
import ChecklistsSideDrawer from "@/features/checklists/sidedrawer/checklists-side-drawer";

export function ProjectChecklists() {
  return (
    <ChecklistsSideDrawer>
      <Button variant="outline">
        <LandPlot />
        Checklists
      </Button>
    </ChecklistsSideDrawer>
  );
}
