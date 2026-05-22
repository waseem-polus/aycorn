import { ViewHeaderControls } from "@/components/project/views/view-header-controls";

export function ViewHeader({
  setTaskDrawerOpen,
}: {
  setTaskDrawerOpen: (open: boolean) => void;
}) {
  return <ViewHeaderControls setTaskDrawerOpen={setTaskDrawerOpen} />;
}
